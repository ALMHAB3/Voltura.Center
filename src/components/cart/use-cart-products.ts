"use client";

import { useEffect, useState } from "react";
import { getCartProducts } from "@/app/actions/cart";
import type { ProductCardData } from "@/lib/queries";
import { useCart } from "@/components/store/cart-provider";

type Fetched = { ids: string; map: Map<number, ProductCardData> };

/** Live product data (price, stock, image) for the lines in the cart. */
export function useCartProducts() {
  const { lines, ready, setQuantity } = useCart();
  const ids = lines.map((l) => l.productId).sort((a, b) => a - b).join(",");
  const [fetched, setFetched] = useState<Fetched | null>(null);

  useEffect(() => {
    if (!ready || !ids) return;
    let cancelled = false;
    getCartProducts(ids.split(",").map(Number)).then((rows) => {
      if (!cancelled) setFetched({ ids, map: new Map(rows.map((r) => [r.id, r])) });
    });
    return () => {
      cancelled = true;
    };
  }, [ids, ready]);

  const loading = !ready || (ids !== "" && fetched?.ids !== ids);
  const map = fetched?.map ?? new Map<number, ProductCardData>();

  // Products that no longer exist or were hidden are dropped from the cart.
  useEffect(() => {
    if (loading) return;
    lines.forEach((l) => {
      if (!map.has(l.productId)) setQuantity(l.productId, 0);
    });
    // Only re-check after a fresh fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, fetched]);

  const items = lines
    .map((l) => ({ ...l, product: map.get(l.productId) }))
    .filter((i): i is typeof i & { product: ProductCardData } => Boolean(i.product));

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const saleTotal = items.reduce((s, i) => s + i.product.sale_price * i.quantity, 0);
  const stockIssues = items.filter((i) => i.quantity > i.product.stock);

  return { items, loading, subtotal, saleTotal, productDiscount: subtotal - saleTotal, stockIssues };
}
