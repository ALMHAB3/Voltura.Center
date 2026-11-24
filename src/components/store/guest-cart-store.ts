import type { CartLine } from "@/app/actions/cart";

/** The guest cart lives in localStorage; this exposes it to React via useSyncExternalStore. */
const KEY = "vc-cart";
const EMPTY: CartLine[] = [];
let cache: CartLine[] | null = null;
const listeners = new Set<() => void>();

function read(): CartLine[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]") as CartLine[];
    return Array.isArray(parsed)
      ? parsed.filter((l) => Number.isInteger(l?.productId) && Number.isInteger(l?.quantity) && l.quantity > 0)
      : EMPTY;
  } catch {
    return EMPTY;
  }
}

export const guestCart = {
  get(): CartLine[] {
    if (cache === null) cache = read();
    return cache;
  },
  getServer(): CartLine[] {
    return EMPTY;
  },
  set(lines: CartLine[]) {
    cache = lines;
    try {
      if (lines.length) localStorage.setItem(KEY, JSON.stringify(lines));
      else localStorage.removeItem(KEY);
    } catch {
      // Storage blocked (private mode): the cart still works for this visit.
    }
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        cache = null;
        listener();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
};
