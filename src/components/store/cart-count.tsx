"use client";

import { useCart } from "./cart-provider";

export function CartCount({ className }: { className?: string }) {
  const { count } = useCart();
  if (!count) return null;
  return (
    <span
      className={
        className ??
        "num absolute -top-1 -end-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-sale px-1 text-[11px] font-bold text-sale-foreground"
      }
      aria-label={`${count} منتج في السلة`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
