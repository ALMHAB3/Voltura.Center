import { Suspense } from "react";
import { PackageSearch } from "lucide-react";
import { getCategories, getListing, getListingFacets, parseListingParams, SORTS } from "@/lib/queries";
import { getWishlistIds } from "@/app/actions/wishlist";
import { ProductGrid } from "@/components/store/product-card";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { LinkButton } from "@/components/ui/button";
import { Filters, MobileFilters, SortSelect, ViewToggle } from "./filters";
import { Pagination } from "./pagination";

type SearchParams = Record<string, string | string[] | undefined>;

export async function ProductListing({
  basePath,
  title,
  description,
  crumbs,
  categorySlug,
  searchParams,
  forceOffers = false,
}: {
  basePath: string;
  title: string;
  description?: string | null;
  crumbs: Crumb[];
  categorySlug?: string;
  searchParams: SearchParams;
  forceOffers?: boolean;
}) {
  const params = parseListingParams(searchParams, categorySlug);
  if (forceOffers) params.offers = true;
  const [listing, facets, categories, wished] = await Promise.all([
    getListing(params),
    getListingFacets(categorySlug),
    getCategories(),
    getWishlistIds(),
  ]);
  const view = searchParams.view === "list" ? "list" : "grid";

  return (
    <div className="mx-auto max-w-7xl px-4 pt-5 lg:px-6">
      <Breadcrumbs items={crumbs} />
      <div className="mb-5">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {params.q ? `نتائج البحث عن «${params.q}»` : title}
        </h1>
        {description && !params.q && <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p>}
      </div>

      <div className="flex gap-6">
        <Suspense>
          <Filters facets={facets} categories={categories} activeCategory={categorySlug} />
        </Suspense>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-3 py-2.5">
            <p className="num text-sm text-muted">
              <strong className="text-foreground">{listing.total}</strong> منتج
            </p>
            <div className="flex items-center gap-2">
              <Suspense>
                <MobileFilters facets={facets} categories={categories} activeCategory={categorySlug} total={listing.total} />
                <SortSelect sorts={SORTS} current={params.sort} />
                <ViewToggle view={view} />
              </Suspense>
            </div>
          </div>

          {listing.products.length ? (
            <ProductGrid products={listing.products} wishedIds={wished} layout={view} prioritizeFirst />
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-4 py-16 text-center">
              <PackageSearch size={40} className="text-muted" aria-hidden />
              <h2 className="font-bold">لا توجد منتجات تطابق اختيارك</h2>
              <p className="text-sm text-muted">جرّب إزالة بعض الفلاتر أو البحث بكلمة أخرى.</p>
              <LinkButton href={basePath} variant="outline" size="sm">
                مسح الفلاتر
              </LinkButton>
            </div>
          )}

          <Pagination page={params.page} pages={listing.pages} basePath={basePath} searchParams={searchParams} />
        </div>
      </div>
    </div>
  );
}
