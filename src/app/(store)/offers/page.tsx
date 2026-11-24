import type { Metadata } from "next";
import { ProductListing } from "@/components/listing/product-listing";

export const metadata: Metadata = {
  title: "العروض",
  description: "خصومات حقيقية لفترة محدودة على لابتوبات وهواتف وشاشات وإكسسوارات في فولتورا سنتر.",
  alternates: { canonical: "/offers" },
};

export default async function OffersPage({ searchParams }: PageProps<"/offers">) {
  return (
    <ProductListing
      basePath="/offers"
      title="العروض والتخفيضات"
      description="أسعار مخفّضة لفترة محدودة، والكمية محدودة."
      crumbs={[{ label: "العروض" }]}
      searchParams={await searchParams}
      forceOffers
    />
  );
}
