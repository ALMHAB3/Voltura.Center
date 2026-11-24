import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Clock, Flame, ShieldCheck, Truck } from "lucide-react";
import { getProduct, getRelatedProducts, getReviews } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { getWishlistIds } from "@/app/actions/wishlist";
import { createClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/images";
import { formatDate, formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Price } from "@/components/ui/price";
import { Stars } from "@/components/ui/stars";
import { Countdown } from "@/components/ui/countdown";
import { SectionHeader } from "@/components/ui/section-header";
import { Gallery } from "@/components/product/gallery";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { ReviewForm } from "@/components/product/review-form";
import { ProductGrid } from "@/components/store/product-card";

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "المنتج غير موجود" };
  const image = imageUrl(product.product_images[0]?.path);
  const description = `${product.name} بسعر ${formatPrice(product.sale_price ?? product.price)} من ${site.nameAr}. ${
    product.stock > 0 ? "متوفر" : "غير متوفر حالياً"
  }، مع ضمان وتوصيل لكل ليبيا.`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${slug}` },
    openGraph: { title: product.name, description, images: image ? [image] : undefined },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const supabase = await createClient();
  const [related, reviews, wished, current] = await Promise.all([
    getRelatedProducts(product.id, product.category_id),
    getReviews(product.id),
    getWishlistIds(),
    getCurrentUser(),
  ]);
  const canReview = current
    ? Boolean((await supabase.rpc("has_purchased", { p_product_id: product.id })).data)
    : false;

  const salePrice = product.sale_price ?? product.price;
  const inStock = product.stock > 0;
  const offerActive = product.discount_percent > 0 && product.offer_ends_at && new Date(product.offer_ends_at) > new Date();
  const specs = Object.entries(product.specs);
  const distribution = [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => r.rating === star).length }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku ?? undefined,
    description: product.description ?? undefined,
    image: product.product_images.map((i) => new URL(imageUrl(i.path)!, site.url).toString()),
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    offers: {
      "@type": "Offer",
      url: `${site.url}/product/${product.slug}`,
      priceCurrency: "LYD",
      price: salePrice,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(product.rating_count > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating_avg, reviewCount: product.rating_count } }
      : {}),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-5 lg:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs
        items={[
          { label: "المتجر", href: "/products" },
          ...(product.category ? [{ label: product.category.name, href: `/category/${product.category.slug}` }] : []),
          { label: product.name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <Gallery images={product.product_images} name={product.name} />

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            {product.category && (
              <Link href={`/category/${product.category.slug}`} className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-semibold text-primary-strong">
                {product.category.name}
              </Link>
            )}
            {product.brand && (
              <Link href={`/products?brand=${product.brand.slug}`} className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold">
                {product.brand.name}
              </Link>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold leading-snug sm:text-3xl">{product.name}</h1>
            {product.rating_count > 0 && (
              <a href="#reviews" className="mt-2 inline-flex items-center gap-2 text-sm text-muted">
                <Stars value={product.rating_avg} />
                <span className="num">
                  {product.rating_avg} ({product.rating_count} تقييم)
                </span>
              </a>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Price price={product.price} salePrice={salePrice} size="lg" />
            {product.discount_percent > 0 && (
              <span className="num rounded-lg bg-sale px-2.5 py-1 text-sm font-bold text-sale-foreground">
                وفّر {formatPrice(product.price - salePrice)}
              </span>
            )}
          </div>

          {offerActive && (
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-sale/30 bg-sale/10 px-4 py-3 text-sm font-semibold text-sale">
              <Flame size={18} aria-hidden />
              العرض ينتهي خلال
              <Countdown endsAt={product.offer_ends_at!} compact className="text-foreground" />
            </div>
          )}

          <p className="flex items-center gap-2 text-sm font-semibold">
            <span className={inStock ? "size-2.5 rounded-full bg-success" : "size-2.5 rounded-full bg-danger"} aria-hidden />
            {!inStock ? (
              <span className="text-danger">غير متوفر حالياً</span>
            ) : product.stock <= 3 ? (
              <span className="text-warning">باقي {product.stock} قطع فقط، اطلب الآن</span>
            ) : (
              <span className="text-success">متوفر في المخزون</span>
            )}
          </p>

          <PurchasePanel productId={product.id} stock={product.stock} wished={wished.includes(product.id)} />

          <ul className="grid grid-cols-3 gap-2 text-center text-xs">
            <li className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-surface px-2 py-3">
              <ShieldCheck size={20} className="text-primary-strong" aria-hidden />
              {product.warranty_months > 0 ? `ضمان ${product.warranty_months} شهر` : "ضمان المتجر"}
            </li>
            <li className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-surface px-2 py-3">
              <Truck size={20} className="text-primary-strong" aria-hidden />
              توصيل لكل ليبيا
            </li>
            <li className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-surface px-2 py-3">
              <BadgeCheck size={20} className="text-primary-strong" aria-hidden />
              منتج أصلي
            </li>
          </ul>
          {product.sku && <p className="num text-xs text-muted">رمز المنتج: {product.sku}</p>}
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="mb-4 text-xl font-bold">الوصف والمواصفات</h2>
          {product.description && <p className="mb-5 whitespace-pre-line text-sm leading-7 text-muted">{product.description}</p>}
          {specs.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full overflow-hidden rounded-xl text-sm">
                <tbody>
                  {product.brand && (
                    <tr className="odd:bg-surface-2">
                      <th scope="row" className="w-2/5 px-4 py-3 text-start font-medium text-muted">الماركة</th>
                      <td className="px-4 py-3 font-semibold">{product.brand.name}</td>
                    </tr>
                  )}
                  {specs.map(([key, value]) => (
                    <tr key={key} className="odd:bg-surface-2">
                      <th scope="row" className="w-2/5 px-4 py-3 text-start font-medium text-muted">{key}</th>
                      <td className="px-4 py-3 font-semibold">{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section id="reviews" className="flex scroll-mt-32 flex-col gap-4 rounded-3xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="text-xl font-bold">التقييمات</h2>
          <div className="flex items-center gap-5">
            <div className="text-center">
              <p className="num text-4xl font-bold">{product.rating_count ? product.rating_avg : "—"}</p>
              <Stars value={product.rating_avg} />
              <p className="num mt-1 text-xs text-muted">{product.rating_count} تقييم</p>
            </div>
            <ul className="flex flex-1 flex-col gap-1">
              {distribution.map(({ star, count }) => (
                <li key={star} className="flex items-center gap-2 text-xs">
                  <span className="num w-3">{star}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <span className="block h-full rounded-full bg-warning" style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }} />
                  </span>
                  <span className="num w-5 text-muted">{count}</span>
                </li>
              ))}
            </ul>
          </div>

          {canReview ? (
            <ReviewForm productId={product.id} slug={product.slug} />
          ) : (
            <p className="rounded-xl bg-surface-2 px-4 py-3 text-sm text-muted">
              {current ? "يمكنك تقييم المنتج بعد استلام طلبك." : (
                <>
                  <Link href={`/account/login?next=/product/${product.slug}`} className="font-semibold text-primary-strong">سجّل دخولك</Link>{" "}
                  لتقييم المنتجات التي اشتريتها.
                </>
              )}
            </p>
          )}

          {reviews.length ? (
            <ul className="flex flex-col divide-y divide-border">
              {reviews.map((r) => (
                <li key={r.id} className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      {r.author_name}
                      <span className="flex items-center gap-1 rounded-md bg-success/10 px-1.5 py-0.5 text-[11px] text-success">
                        <BadgeCheck size={12} aria-hidden /> مشتري موثّق
                      </span>
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <Clock size={12} aria-hidden /> {formatDate(r.created_at)}
                    </span>
                  </div>
                  <Stars value={r.rating} size={12} className="mt-1" />
                  {r.comment && <p className="mt-1.5 text-sm leading-6">{r.comment}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">لا توجد تقييمات بعد.</p>
          )}
        </section>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <SectionHeader title="منتجات مشابهة" href={product.category ? `/category/${product.category.slug}` : "/products"} />
          <ProductGrid products={related} wishedIds={wished} />
        </section>
      )}
    </div>
  );
}
