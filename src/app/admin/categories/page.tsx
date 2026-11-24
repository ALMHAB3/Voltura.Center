import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { EntityForm } from "@/components/admin/entity-form";
import { CheckField, EditDetails, SelectField, TextField } from "@/components/admin/fields";
import { DeleteButton } from "@/components/admin/delete-button";
import { CategoryIcon, categoryIconNames } from "@/components/store/category-icon";
import { deleteRow, saveCategory } from "@/app/actions/admin";

export const metadata = { title: "الأقسام" };

type Cat = { id: number; name: string; slug: string; icon: string; parent_id: number | null; sort_order: number; description: string | null; is_active: boolean };

function CategoryFields({ c, roots }: { c?: Cat; roots: Cat[] }) {
  const p = c ? `c${c.id}` : "cnew";
  return (
    <>
      {c && <input type="hidden" name="id" value={c.id} />}
      <TextField prefix={p} name="name" label="اسم القسم" defaultValue={c?.name} />
      <TextField prefix={p} name="slug" label="الرابط (إنجليزي)" defaultValue={c?.slug} ltr hint="مثل laptops" />
      <SelectField prefix={p} name="parentId" label="القسم الرئيسي" defaultValue={c?.parent_id} hint="اتركه فارغاً لقسم رئيسي">
        <option value="">— قسم رئيسي —</option>
        {roots.filter((r) => r.id !== c?.id).map((r) => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </SelectField>
      <SelectField prefix={p} name="icon" label="الأيقونة" defaultValue={c?.icon ?? "box"}>
        {categoryIconNames.map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </SelectField>
      <TextField prefix={p} name="sortOrder" label="الترتيب" type="number" defaultValue={c?.sort_order ?? 0} />
      <CheckField name="isActive" label="ظاهر في المتجر" defaultChecked={c?.is_active ?? true} />
      <TextField prefix={p} name="description" label="وصف (يظهر أعلى صفحة القسم)" defaultValue={c?.description} className="sm:col-span-2" />
    </>
  );
}

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("sort_order");
  const all = (data ?? []) as Cat[];
  const roots = all.filter((c) => !c.parent_id);
  const ordered = roots.flatMap((r) => [r, ...all.filter((c) => c.parent_id === r.id)]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="الأقسام" description="الأقسام الفرعية تظهر تحت قسمها الرئيسي في القائمة." />
      <Panel title="قسم جديد">
        <div className="p-4">
          <EntityForm action={saveCategory} submitLabel="إضافة القسم" resetOnSuccess>
            <CategoryFields roots={roots} />
          </EntityForm>
        </div>
      </Panel>
      <Panel>
        <ul className="divide-y divide-border">
          {ordered.map((c) => (
            <li key={c.id} className="px-4 py-3">
              <div className="flex items-center gap-3">
                <span className={`flex size-9 items-center justify-center rounded-lg bg-surface-2 text-primary-strong ${c.parent_id ? "ms-8" : ""}`}>
                  <CategoryIcon name={c.icon} size={18} />
                </span>
                <span className="flex-1">
                  <span className="font-semibold">{c.name}</span>
                  <span className="ms-2 text-xs text-muted" dir="ltr">/{c.slug}</span>
                  {!c.is_active && <span className="ms-2 text-xs text-danger">مخفي</span>}
                </span>
                <DeleteButton onDelete={deleteRow.bind(null, "categories", c.id)} />
              </div>
              <EditDetails>
                <EntityForm action={saveCategory}>
                  <CategoryFields c={c} roots={roots} />
                </EntityForm>
              </EditDetails>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
