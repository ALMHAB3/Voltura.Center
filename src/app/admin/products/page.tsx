import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import { normalizeSearch } from "@/lib/format";
import { AdminPageHeader, Panel, Table } from "@/components/admin/ui";
import { LinkButton } from "@/components/ui/button";
import { Pagination } from "@/components/listing/pagination";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteProduct } from "@/app/actions/admin";

export const metadata = { title: "المنتجات" };
const PAGE = 20;

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("id, name, slug, sku, price, sale_price, discount_percent, stock, is_active, is_featured, category:categories(name), product_images(path, sort_order)", { count: "exact" })
    .order("created_at", { ascending: false });
  const term = normalizeSearch(q).replace(/[%_,()]/g, " ").trim();
  if (term) query = query.ilike("search_text", `%${term}%`);
  if (sp.stock === "low") query = query.lte("stock", 3);
  const { data: products, count } = await query.range((page - 1) * PAGE, page * PAGE - 1);

  return (
    <div>
      <AdminPageHeader
        title="المنتجات"
        description={`${count ?? 0} منتج`}
        actions={
          <LinkButton href="/admin/products/new">
            <Plus size={16} aria-hidden /> منتج جديد
          </LinkButton>
        }
      />
      <form className="mb-4 flex flex-wrap gap-2" action="/admin/products">
        <label htmlFor="prod-q" className="sr-only">بحث</label>
        <input id="prod-q" name="q" defaultValue={q} placeholder="ابحث بالاسم أو SKU" className="h-10 w-72 rounded-xl border border-border bg-surface px-3 text-sm" />
        <Link href="/admin/products?stock=low" className="flex h-10 items-center rounded-xl bg-surface px-3 text-sm hover:bg-surface-2">
          المخزون المنخفض
        </Link>
      </form>
      <Panel>
        <Table>
          <thead>
            <tr>
              <th>المنتج</th>
              <th>القسم</th>
              <th>السعر</th>
              <th>المخزون</th>
              <th>الحالة</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p) => {
              const img = [...p.product_images].sort((a, b) => a.sort_order - b.sort_order)[0];
              return (
                <tr key={p.id}>
                  <td>
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                      <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                        {img && <Image src={imageUrl(img.path)!} alt="" fill sizes="44px" className="object-cover" />}
                      </span>
                      <span>
                        <span className="line-clamp-1 font-semibold hover:text-primary-strong">{p.name}</span>
                        <span className="num block text-xs text-muted">{p.sku}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="text-xs">{p.category?.name}</td>
                  <td className="num">
                    <span className="font-semibold">{formatPrice(p.sale_price)}</span>
                    {p.discount_percent > 0 && <span className="block text-xs text-muted line-through">{formatPrice(p.price)}</span>}
                  </td>
                  <td>
                    <span className={`num rounded-lg px-2 py-0.5 text-xs font-bold ${p.stock === 0 ? "bg-danger/15 text-danger" : p.stock <= 3 ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="text-xs">
                    {p.is_active ? "ظاهر" : <span className="text-muted">مخفي</span>}
                    {p.is_featured && <span className="ms-1 text-primary-strong">· مميز</span>}
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <Link href={`/admin/products/${p.id}`} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary-strong hover:bg-surface-2">
                        تعديل
                      </Link>
                      <DeleteButton onDelete={deleteProduct.bind(null, p.id)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Panel>
      <Pagination page={page} pages={Math.max(1, Math.ceil((count ?? 0) / PAGE))} basePath="/admin/products" searchParams={sp} />
    </div>
  );
}
