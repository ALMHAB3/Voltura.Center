"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { useCart } from "@/components/store/cart-provider";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/store/wishlist-button";

export function PurchasePanel({ productId, stock, wished }: { productId: number; stock: number; wished: boolean }) {
  const [qty, setQty] = useState(1);
  const { add, lines } = useCart();
  const router = useRouter();
  const inCart = lines.find((l) => l.productId === productId)?.quantity ?? 0;
  const max = Math.max(0, Math.min(stock - inCart, 99));

  if (stock <= 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="rounded-2xl bg-surface-2 px-4 py-3 text-center font-semibold text-muted">نفد المخزون حالياً</div>
        <WishlistButton productId={productId} initial={wished} withLabel className="h-11 rounded-xl border border-border bg-surface text-sm font-semibold hover:border-primary-strong" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">الكمية</span>
        <div className="flex items-center rounded-xl border border-border bg-surface">
          <button type="button" aria-label="إنقاص الكمية" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} className="flex size-10 items-center justify-center disabled:opacity-40">
            <Minus size={16} aria-hidden />
          </button>
          <output className="num w-10 text-center font-bold" aria-live="polite">
            {qty}
          </output>
          <button type="button" aria-label="زيادة الكمية" onClick={() => setQty((q) => Math.min(max, q + 1))} disabled={qty >= max} className="flex size-10 items-center justify-center disabled:opacity-40">
            <Plus size={16} aria-hidden />
          </button>
        </div>
        {inCart > 0 && <span className="num text-xs text-muted">في سلتك: {inCart}</span>}
      </div>

      {max <= 0 ? (
        <p className="rounded-xl bg-warning/10 px-3 py-2 text-sm text-warning">أضفت كل الكمية المتوفرة إلى سلتك.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="lg"
            onClick={() => {
              add(productId, qty, { silent: true });
              router.push("/checkout");
            }}
          >
            <Zap size={18} aria-hidden />
            اشترِ الآن
          </Button>
          <Button size="lg" variant="ink" onClick={() => add(productId, qty)}>
            <ShoppingCart size={18} aria-hidden />
            أضف للسلة
          </Button>
        </div>
      )}
      <WishlistButton productId={productId} initial={wished} withLabel className="h-11 rounded-xl border border-border bg-surface text-sm font-semibold hover:border-primary-strong" />
    </div>
  );
}
