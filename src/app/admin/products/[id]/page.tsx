import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAdminOptions } from "@/lib/admin-data";
import { AdminPageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteProduct } from "@/app/actions/admin";

export const metadata = { title: "تعديل منتج" };

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const supabase = await createClient();
  const [{ data: p }, options] = await Promise.all([
    supabase.from("products").select("*, product_images(path, sort_order)").eq("id", id).maybeSingle(),
    getAdminOptions(),
  ]);
  if (!p) notFound();

  return (
    <div>
      <AdminPageHeader
        title={p.name}
        actions={
          <>
            <Link href={`/product/${p.slug}`} target="_blank" className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-primary-strong hover:bg-surface-2">
              <ExternalLink size={14} aria-hidden /> عرض في المتجر
            </Link>
            <DeleteButton onDelete={deleteProduct.bind(null, p.id)} redirectTo="/admin/products" />
          </>
        }
      />
      <ProductForm
        id={p.id}
        categories={options.categories}
        brands={options.brands}
        defaults={{
          name: p.name,
          slug: p.slug,
          sku: p.sku ?? "",
          categoryId: p.category_id ?? ("" as unknown as number),
          brandId: p.brand_id ?? ("" as unknown as number),
          description: p.description ?? "",
          price: p.price,
          discountPercent: p.discount_percent,
          costPrice: p.cost_price ?? ("" as unknown as number),
          stock: p.stock,
          warrantyMonths: p.warranty_months,
          offerEndsAt: toLocalInput(p.offer_ends_at),
          isFeatured: p.is_featured,
          isActive: p.is_active,
          specs: Object.entries((p.specs ?? {}) as Record<string, string>).map(([key, value]) => ({ key, value: String(value) })),
          images: [...p.product_images].sort((a, b) => a.sort_order - b.sort_order).map((i) => ({ path: i.path })),
        }}
      />
    </div>
  );
}
