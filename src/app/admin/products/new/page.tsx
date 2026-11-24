import { getAdminOptions } from "@/lib/admin-data";
import { AdminPageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "منتج جديد" };

export default async function NewProductPage() {
  const { categories, brands } = await getAdminOptions();
  return (
    <div>
      <AdminPageHeader title="منتج جديد" />
      <ProductForm
        id={null}
        categories={categories}
        brands={brands}
        defaults={{
          name: "",
          slug: "",
          sku: "",
          categoryId: "" as unknown as number,
          brandId: "" as unknown as number,
          description: "",
          price: "" as unknown as number,
          discountPercent: 0,
          costPrice: "" as unknown as number,
          stock: 0,
          warrantyMonths: 0,
          offerEndsAt: "",
          isFeatured: false,
          isActive: true,
          specs: [],
          images: [],
        }}
      />
    </div>
  );
}
