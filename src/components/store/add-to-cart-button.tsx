"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart, Zap } from "lucide-react";
import { useCart } from "./cart-provider";
import { buttonClass } from "@/components/ui/button";

/** Card actions: add to cart, or buy now (adds and goes straight to checkout). */
export function CardCartActions({ productId, inStock }: { productId: number; inStock: boolean }) {
  const { add } = useCart();
  const router = useRouter();
  if (!inStock) {
    return (
      <span className="flex h-10 items-center justify-center rounded-xl bg-surface-2 text-sm font-semibold text-muted">
        نفد المخزون
      </span>
    );
  }
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => {
          add(productId, 1, { silent: true });
          router.push("/checkout");
        }}
        className={buttonClass("primary", "sm", "h-10 flex-1 whitespace-nowrap px-2 text-xs sm:text-sm")}
      >
        <Zap size={16} className="hidden sm:block" aria-hidden />
        اشترِ الآن
      </button>
      <button
        type="button"
        onClick={() => add(productId)}
        aria-label="أضف إلى السلة"
        className={buttonClass("outline", "icon", "size-10 shrink-0")}
      >
        <ShoppingCart size={18} aria-hidden />
      </button>
    </div>
  );
}
