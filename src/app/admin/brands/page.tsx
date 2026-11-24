import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { EntityForm } from "@/components/admin/entity-form";
import { CheckField, EditDetails, TextField } from "@/components/admin/fields";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteRow, saveBrand } from "@/app/actions/admin";

export const metadata = { title: "الماركات" };

type Brand = { id: number; name: string; slug: string; sort_order: number; is_active: boolean };

function BrandFields({ b }: { b?: Brand }) {
  const p = b ? `b${b.id}` : "bnew";
  return (
    <>
      {b && <input type="hidden" name="id" value={b.id} />}
      <TextField prefix={p} name="name" label="اسم الماركة" defaultValue={b?.name} ltr />
      <TextField prefix={p} name="slug" label="الرابط" defaultValue={b?.slug} ltr />
      <TextField prefix={p} name="sortOrder" label="الترتيب" type="number" defaultValue={b?.sort_order ?? 0} />
      <CheckField name="isActive" label="ظاهرة" defaultChecked={b?.is_active ?? true} />
    </>
  );
}

export default async function BrandsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("brands").select("*").order("sort_order");
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="الماركات" />
      <Panel title="ماركة جديدة">
        <div className="p-4">
          <EntityForm action={saveBrand} submitLabel="إضافة" resetOnSuccess>
            <BrandFields />
          </EntityForm>
        </div>
      </Panel>
      <Panel>
        <ul className="divide-y divide-border">
          {(data ?? []).map((b) => (
            <li key={b.id} className="px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex-1 font-semibold">
                  {b.name} {!b.is_active && <span className="text-xs text-danger">مخفية</span>}
                </span>
                <DeleteButton onDelete={deleteRow.bind(null, "brands", b.id)} />
              </div>
              <EditDetails>
                <EntityForm action={saveBrand}>
                  <BrandFields b={b} />
                </EntityForm>
              </EditDetails>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
