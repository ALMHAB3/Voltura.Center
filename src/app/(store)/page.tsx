import { Flame } from "lucide-react";
import { getBanners, getBrands, getCategories, getNextOfferEnd, getProductCards } from "@/lib/queries";
import { getWishlistIds } from "@/app/actions/wishlist";
import { HeroSlider } from "@/components/home/hero-slider";
import { CategoryGrid } from "@/components/home/category-grid";
import { Features } from "@/components/home/features";
import { BrandStrip } from "@/components/home/brand-strip";
import { ProductGrid } from "@/components/store/product-card";
import { SectionHeader } from "@/components/ui/section-header";
import { Countdown } from "@/components/ui/countdown";
import { site } from "@/lib/site";

export default async function HomePage() {
  const [banners, categories, brands, featured, latest, offers, offerEnd, wished] = await Promise.all([
    getBanners(),
    getCategories(),
    getBrands(),
    getProductCards("featured", 8),
    getProductCards("latest", 8),
    getProductCards("offers", 4),
    getNextOfferEnd(),
    getWishlistIds(),
  ]);

  const storeJsonLd = {
    "@context": "https://schema.org",
    "@type": "ElectronicsStore",
    name: site.name,
    alternateName: site.nameAr,
    url: site.url,
    telephone: site.phoneIntl,
    email: site.email,
    address: { "@type": "PostalAddress", addressLocality: "مصراتة", addressCountry: "LY" },
    sameAs: [site.social.instagram, site.social.facebook],
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 pt-4 sm:gap-14 sm:pt-6 lg:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }} />
      <h1 className="sr-only">{site.nameAr}: {site.tagline}</h1>

      <HeroSlider banners={banners} />

      <section>
        <SectionHeader eyebrow="تسوّق حسب القسم" title="الأقسام" href="/products" linkLabel="كل المنتجات" />
        <CategoryGrid categories={categories} />
      </section>

      {offers.length > 0 && (
        <section className="rounded-3xl border border-border bg-surface p-4 sm:p-6">
          <SectionHeader
            eyebrow="لفترة محدودة"
            title="عروض بخصومات حقيقية"
            href="/offers"
            aside={offerEnd ? <Countdown endsAt={offerEnd} className="hidden sm:flex" /> : null}
          />
          {offerEnd && (
            <div className="-mt-2 mb-4 flex items-center gap-2 text-sm text-muted sm:hidden">
              <Flame size={16} className="text-sale" aria-hidden />
              ينتهي العرض خلال <Countdown endsAt={offerEnd} compact className="font-bold text-foreground" />
            </div>
          )}
          <ProductGrid products={offers} wishedIds={wished} />
        </section>
      )}

      <section>
        <SectionHeader eyebrow="مختارة لك" title="منتجات مميزة" href="/products?sort=popular" />
        <ProductGrid products={featured} wishedIds={wished} />
      </section>

      <Features />

      <section>
        <SectionHeader eyebrow="وصل حديثاً" title="أحدث المنتجات" href="/products" />
        <ProductGrid products={latest} wishedIds={wished} />
      </section>

      <section>
        <SectionHeader eyebrow="علامات تجارية" title="الماركات لدينا" />
        <BrandStrip brands={brands} />
      </section>
    </div>
  );
}
