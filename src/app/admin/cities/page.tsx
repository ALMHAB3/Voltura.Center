import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { EntityForm } from "@/components/admin/entity-form";
import { CheckField, EditDetails, TextField } from "@/components/admin/fields";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteRow, saveCity } from "@/app/actions/admin";

export const metadata = { title: "المدن والتوصيل" };

type City = { id: number; name: string; delivery_fee: number; delivery_days: string | null; vanex_city_id: number | null; is_active: boolean };

function CityFields({ c }: { c?: City }) {
  const p = c ? `ct${c.id}` : "ctnew";
  return (
    <>
      {c && <input type="hidden" name="id" value={c.id} />}
      <TextField prefix={p} name="name" label="المدينة" defaultValue={c?.name} />
      <TextField prefix={p} name="deliveryFee" label="رسوم التوصيل (د.ل)" type="number" defaultValue={c?.delivery_fee} />
      <TextField prefix={p} name="deliveryDays" label="المدة المتوقعة" defaultValue={c?.delivery_days} hint="مثل 1-2 يوم" />
      <TextField prefix={p} name="vanexCityId" label="رقم المدينة في Vanex" type="number" defaultValue={c?.vanex_city_id} hint="اختياري، للربط مع Vanex" />
      <CheckField name="isActive" label="التوصيل متاح" defaultChecked={c?.is_active ?? true} />
    </>
  );
}

export default async function CitiesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("cities").select("*").order("sort_order");
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="المدن ورسوم التوصيل" />
      <Panel title="مدينة جديدة">
        <div className="p-4">
          <EntityForm action={saveCity} submitLabel="إضافة" resetOnSuccess>
            <CityFields />
          </EntityForm>
        </div>
      </Panel>
      <Panel>
        <ul className="divide-y divide-border">
          {(data ?? []).map((c) => (
            <li key={c.id} className="px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex-1">
                  <span className="font-semibold">{c.name}</span>
                  <span className="num ms-2 text-sm">{formatPrice(c.delivery_fee)}</span>
                  <span className="ms-2 text-xs text-muted">{c.delivery_days}</span>
                  {!c.is_active && <span className="ms-2 text-xs text-danger">متوقف</span>}
                </span>
                <DeleteButton onDelete={deleteRow.bind(null, "cities", c.id)} />
              </div>
              <EditDetails>
                <EntityForm action={saveCity}>
                  <CityFields c={c} />
                </EntityForm>
              </EditDetails>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
