import type { Metadata } from "next";
import { ProductListing } from "@/components/listing/product-listing";

export async function generateMetadata({ searchParams }: PageProps<"/products">): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `بحث: ${q}` : "كل المنتجات",
    description: "تصفح كل منتجات فولتورا سنتر: لابتوبات، هواتف، شاشات، قطع كمبيوتر وإكسسوارات بأسعار بالدينار الليبي.",
    alternates: { canonical: "/products" },
    robots: q ? { index: false } : undefined,
  };
}

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  return (
    <ProductListing
      basePath="/products"
      title="كل المنتجات"
      crumbs={[{ label: "المتجر" }]}
      searchParams={await searchParams}
    />
  );
}
