import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories } from "@/lib/queries";
import { ProductListing } from "@/components/listing/product-listing";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = (await getCategories()).find((c) => c.slug === slug);
  if (!category) return { title: "القسم غير موجود" };
  return {
    title: category.name,
    description: category.description ?? `تسوّق ${category.name} من ${site.nameAr} بأفضل الأسعار في ليبيا، مع ضمان وتوصيل لكل المدن.`,
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();
  const parent = category.parent_id ? categories.find((c) => c.id === category.parent_id) : undefined;

  return (
    <ProductListing
      basePath={`/category/${slug}`}
      title={category.name}
      description={category.description}
      categorySlug={slug}
      crumbs={[
        { label: "المتجر", href: "/products" },
        ...(parent ? [{ label: parent.name, href: `/category/${parent.slug}` }] : []),
        { label: category.name },
      ]}
      searchParams={await searchParams}
    />
  );
}
