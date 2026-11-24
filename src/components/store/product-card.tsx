import Image from "next/image";
import Link from "next/link";
import type { ProductCardData } from "@/lib/queries";
import { imageUrl } from "@/lib/images";
import { Price } from "@/components/ui/price";
import { Stars } from "@/components/ui/stars";
import { cn } from "@/lib/cn";
import { CardCartActions } from "./add-to-cart-button";
import { WishlistButton } from "./wishlist-button";

export function ProductCard({
  product,
  wished = false,
  layout = "grid",
  priority = false,
}: {
  product: ProductCardData;
  wished?: boolean;
  layout?: "grid" | "list";
  priority?: boolean;
}) {
  const inStock = product.stock > 0;
  const src = imageUrl(product.image);
  const isList = layout === "list";

  return (
    <article
      className={cn(
        "group relative flex overflow-hidden rounded-2xl border border-border bg-surface transition hover:-translate-y-0.5 hover:border-primary-strong/40 hover:shadow-card",
        isList ? "flex-row" : "flex-col",
      )}
    >
      <Link
        href={`/product/${product.slug}`}
        className={cn("relative block shrink-0 overflow-hidden bg-surface-2", isList ? "w-32 sm:w-48" : "aspect-square")}
        tabIndex={-1}
        aria-hidden
      >
        {src && (
          <Image
            src={src}
            alt=""
            fill
            priority={priority}
            sizes={isList ? "200px" : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"}
            className={cn("object-cover transition duration-500 group-hover:scale-105", !inStock && "opacity-60 grayscale")}
          />
        )}
      </Link>

      <div className="pointer-events-none absolute start-2.5 top-2.5 flex flex-col items-start gap-1.5">
        {product.discount_percent > 0 && (
          <span className="num rounded-lg bg-sale px-2 py-0.5 text-xs font-bold text-sale-foreground">
            -{product.discount_percent}%
          </span>
        )}
        {inStock && product.stock <= 3 && (
          <span className="rounded-lg bg-warning px-2 py-0.5 text-xs font-bold text-white">متبقي {product.stock}</span>
        )}
        {product.sold_count >= 5 && (
          <span className="rounded-lg bg-ink px-2 py-0.5 text-xs font-semibold text-primary">الأكثر مبيعاً</span>
        )}
      </div>
      <WishlistButton
        productId={product.id}
        initial={wished}
        className="absolute end-2.5 top-2.5 z-10 size-9 rounded-full bg-surface/90 text-foreground shadow-card backdrop-blur hover:text-sale"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3 sm:p-4">
        {product.brand && (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-strong">{product.brand.name}</span>
        )}
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-foreground">
          <Link href={`/product/${product.slug}`} className="after:absolute after:inset-0 after:content-[''] focus:outline-none">
            {product.name}
          </Link>
        </h3>
        {product.rating_count > 0 ? (
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Stars value={product.rating_avg} size={12} />
            <span className="num">({product.rating_count})</span>
          </div>
        ) : (
          <div className="h-4" aria-hidden />
        )}
        <Price price={product.price} salePrice={product.sale_price} size="sm" className="mt-auto" />
        <div className="relative z-10 mt-1">
          <CardCartActions productId={product.id} inStock={inStock} />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({
  products,
  wishedIds = [],
  layout = "grid",
  prioritizeFirst = false,
}: {
  products: ProductCardData[];
  wishedIds?: number[];
  layout?: "grid" | "list";
  prioritizeFirst?: boolean;
}) {
  return (
    <div
      className={
        layout === "list"
          ? "flex flex-col gap-3"
          : "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
      }
    >
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} wished={wishedIds.includes(p.id)} layout={layout} priority={prioritizeFirst && i < 4} />
      ))}
    </div>
  );
}
