import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getProductCardsByIds } from "@/lib/queries";
import { getWishlistIds } from "@/app/actions/wishlist";
import { ProductGrid } from "@/components/store/product-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = { title: "المفضلة", robots: { index: false } };

export default async function WishlistPage() {
  await requireUser("/wishlist");
  const ids = await getWishlistIds();
  const products = await getProductCardsByIds(ids);
  return (
    <div className="mx-auto max-w-7xl px-4 pt-5 lg:px-6">
      <Breadcrumbs items={[{ label: "المفضلة" }]} />
      <h1 className="mb-5 text-2xl font-bold sm:text-3xl">المفضلة</h1>
      {products.length ? (
        <ProductGrid products={products} wishedIds={ids} />
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-surface py-16 text-center">
          <Heart size={36} className="text-muted" aria-hidden />
          <p className="font-semibold">لم تحفظ أي منتج بعد</p>
          <p className="text-sm text-muted">اضغط على القلب في أي منتج لحفظه هنا.</p>
          <LinkButton href="/products" size="sm">
            تصفح المنتجات
          </LinkButton>
        </div>
      )}
    </div>
  );
}
