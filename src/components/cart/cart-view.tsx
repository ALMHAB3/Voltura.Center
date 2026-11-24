"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "@/components/store/cart-provider";
import { LinkButton } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import { useCartProducts } from "./use-cart-products";

export function CartView() {
  const { setQuantity, remove, lines } = useCart();
  const { items, loading, subtotal, saleTotal, productDiscount, stockIssues } = useCartProducts();

  if (loading && !items.length && lines.length) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]" aria-busy="true">
        <div className="flex flex-col gap-3">
          {lines.map((l) => (
            <Skeleton key={l.productId} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-surface px-4 py-20 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-surface-2 text-muted">
          <ShoppingCart size={32} aria-hidden />
        </span>
        <h2 className="text-lg font-bold">سلتك فارغة</h2>
        <p className="max-w-sm text-sm text-muted">لم تُضف أي منتج بعد. تصفّح الأقسام واختر ما يناسبك.</p>
        <LinkButton href="/products">ابدأ التسوق</LinkButton>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]">
      <ul className="flex flex-col gap-3">
        {items.map(({ product, quantity }) => {
          const over = quantity > product.stock;
          return (
            <li key={product.id} className="flex gap-3 rounded-2xl border border-border bg-surface p-3 sm:gap-4 sm:p-4">
              <Link href={`/product/${product.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:size-28">
                {product.image && <Image src={imageUrl(product.image)!} alt="" fill sizes="112px" className="object-cover" />}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/product/${product.slug}`} className="line-clamp-2 text-sm font-semibold hover:text-primary-strong">
                    {product.name}
                  </Link>
                  <button type="button" onClick={() => remove(product.id)} aria-label={`حذف ${product.name}`} className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger">
                    <Trash2 size={18} aria-hidden />
                  </button>
                </div>
                <div className="num text-sm">
                  <span className="font-bold">{formatPrice(product.sale_price)}</span>
                  {product.sale_price < product.price && <span className="ms-2 text-xs text-muted line-through">{formatPrice(product.price)}</span>}
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center rounded-xl border border-border">
                    <button type="button" aria-label="إنقاص" disabled={quantity <= 1} onClick={() => setQuantity(product.id, quantity - 1)} className="flex size-9 items-center justify-center disabled:opacity-40">
                      <Minus size={15} aria-hidden />
                    </button>
                    <span className="num w-8 text-center text-sm font-bold">{quantity}</span>
                    <button type="button" aria-label="زيادة" disabled={quantity >= product.stock} onClick={() => setQuantity(product.id, quantity + 1)} className="flex size-9 items-center justify-center disabled:opacity-40">
                      <Plus size={15} aria-hidden />
                    </button>
                  </div>
                  <span className="num font-bold">{formatPrice(product.sale_price * quantity)}</span>
                </div>
                {over && (
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-danger">
                    <AlertTriangle size={14} aria-hidden />
                    {product.stock === 0 ? "نفد هذا المنتج، احذفه لإكمال الطلب" : `المتوفر ${product.stock} فقط`}
                    {product.stock > 0 && (
                      <button type="button" className="underline" onClick={() => setQuantity(product.id, product.stock)}>
                        تعديل
                      </button>
                    )}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-32">
        <h2 className="text-lg font-bold">ملخص السلة</h2>
        <dl className="num flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">المجموع قبل الخصم</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          {productDiscount > 0 && (
            <div className="flex justify-between text-success">
              <dt>خصم المنتجات</dt>
              <dd>- {formatPrice(productDiscount)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
            <dt>المجموع</dt>
            <dd>{formatPrice(saleTotal)}</dd>
          </div>
        </dl>
        <p className="text-xs text-muted">رسوم التوصيل وكود الخصم في الخطوة التالية.</p>
        {stockIssues.length > 0 ? (
          <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">عدّل الكميات المظللة بالأحمر لإكمال الطلب.</p>
        ) : (
          <LinkButton href="/checkout" size="lg">
            إتمام الطلب
          </LinkButton>
        )}
        <Link href="/products" className="text-center text-sm font-semibold text-primary-strong hover:underline">
          متابعة التسوق
        </Link>
      </aside>
    </div>
  );
}
