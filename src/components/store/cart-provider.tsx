"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { mergeGuestCart, setCartQuantity, type CartLine } from "@/app/actions/cart";
import { toast } from "@/components/ui/toaster";
import { guestCart } from "./guest-cart-store";

type CartContextValue = {
  lines: CartLine[];
  count: number;
  ready: boolean;
  add: (productId: number, quantity?: number, options?: { silent?: boolean }) => void;
  setQuantity: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const noopSubscribe = () => () => {};

function upsert(lines: CartLine[], productId: number, quantity: number): CartLine[] {
  const q = Math.max(0, Math.min(99, Math.floor(quantity)));
  if (!q) return lines.filter((l) => l.productId !== productId);
  return lines.some((l) => l.productId === productId)
    ? lines.map((l) => (l.productId === productId ? { ...l, quantity: q } : l))
    : [...lines, { productId, quantity: q }];
}

/**
 * Guests: cart in localStorage. Signed-in customers: cart in Supabase.
 * The root layout remounts this provider (via `key`) when the visitor signs in or out.
 */
export function CartProvider({ children, isSignedIn, initialItems }: { children: ReactNode; isSignedIn: boolean; initialItems: CartLine[] }) {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const guestLines = useSyncExternalStore(guestCart.subscribe, guestCart.get, guestCart.getServer);
  const [serverLines, setServerLines] = useState<CartLine[]>(initialItems);
  const merging = useRef(false);

  // After sign-in, move anything from the guest cart into the saved cart.
  useEffect(() => {
    if (!isSignedIn || merging.current) return;
    const guest = guestCart.get();
    if (!guest.length) return;
    merging.current = true;
    mergeGuestCart(guest).then((merged) => {
      guestCart.set([]);
      setServerLines(merged);
    });
  }, [isSignedIn]);

  const lines = isSignedIn ? serverLines : guestLines;
  const linesRef = useRef(lines);
  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  const setQuantity = useCallback(
    (productId: number, quantity: number) => {
      const next = upsert(linesRef.current, productId, quantity);
      linesRef.current = next;
      if (isSignedIn) {
        setServerLines(next);
        void setCartQuantity(productId, Math.max(0, Math.min(99, Math.floor(quantity))));
      } else {
        guestCart.set(next);
      }
    },
    [isSignedIn],
  );

  const add = useCallback<CartContextValue["add"]>(
    (productId, quantity = 1, options) => {
      const existing = linesRef.current.find((l) => l.productId === productId)?.quantity ?? 0;
      setQuantity(productId, existing + quantity);
      if (!options?.silent) toast("تمت الإضافة إلى السلة");
    },
    [setQuantity],
  );

  const remove = useCallback((productId: number) => setQuantity(productId, 0), [setQuantity]);

  // Called after an order is placed (the database already emptied the saved cart).
  const clear = useCallback(() => {
    linesRef.current = [];
    if (isSignedIn) setServerLines([]);
    else guestCart.set([]);
  }, [isSignedIn]);

  const value = useMemo(
    () => ({ lines, count: lines.reduce((s, l) => s + l.quantity, 0), ready: isSignedIn || hydrated, add, setQuantity, remove, clear }),
    [lines, isSignedIn, hydrated, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
