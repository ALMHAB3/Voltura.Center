import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPrice } from "@/lib/format";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { EntityForm } from "@/components/admin/entity-form";
import { CheckField, EditDetails, SelectField, TextField } from "@/components/admin/fields";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteRow, saveCoupon } from "@/app/actions/admin";

export const metadata = { title: "الكوبونات" };

type Coupon = { id: number; code: string; type: "percent" | "fixed"; value: number; min_subtotal: number; max_discount: number | null; usage_limit: number | null; used_count: number; expires_at: string | null; is_active: boolean };

function CouponFields({ c }: { c?: Coupon }) {
  const p = c ? `cp${c.id}` : "cpnew";
  return (
    <>
      {c && <input type="hidden" name="id" value={c.id} />}
      <TextField prefix={p} name="code" label="الكود" defaultValue={c?.code} ltr />
      <SelectField prefix={p} name="type" label="النوع" defaultValue={c?.type ?? "percent"}>
        <option value="percent">نسبة مئوية %</option>
        <option value="fixed">مبلغ ثابت د.ل</option>
      </SelectField>
      <TextField prefix={p} name="value" label="القيمة" type="number" defaultValue={c?.value} />
      <TextField prefix={p} name="minSubtotal" label="الحد الأدنى للطلب (د.ل)" type="number" defaultValue={c?.min_subtotal ?? 0} />
      <TextField prefix={p} name="maxDiscount" label="أقصى خصم (د.ل)" type="number" defaultValue={c?.max_discount} hint="اختياري، للنسبة المئوية" />
      <TextField prefix={p} name="usageLimit" label="عدد مرات الاستخدام" type="number" defaultValue={c?.usage_limit} hint="اتركه فارغاً لعدد غير محدود" />
      <TextField prefix={p} name="expiresAt" label="ينتهي في" type="date" defaultValue={c?.expires_at?.slice(0, 10)} />
      <CheckField name="isActive" label="مفعّل" defaultChecked={c?.is_active ?? true} />
    </>
  );
}

export default async function CouponsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="كوبونات الخصم" description="خصم الكوبون يُحسب على المجموع بعد خصومات المنتجات، قبل رسوم التوصيل." />
      <Panel title="كوبون جديد">
        <div className="p-4">
          <EntityForm action={saveCoupon} submitLabel="إضافة الكوبون" resetOnSuccess>
            <CouponFields />
          </EntityForm>
        </div>
      </Panel>
      <Panel>
        <ul className="divide-y divide-border">
          {(data ?? []).map((c) => (
            <li key={c.id} className="px-4 py-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="num rounded-lg bg-ink px-2.5 py-1 font-bold text-primary" dir="ltr">{c.code}</span>
                <span className="flex-1 text-sm">
                  {c.type === "percent" ? `${c.value}%` : formatPrice(c.value)}
                  {c.max_discount ? ` (حتى ${formatPrice(c.max_discount)})` : ""} · حد أدنى {formatPrice(c.min_subtotal)}
                  <span className="num block text-xs text-muted">
                    استُخدم {c.used_count}{c.usage_limit ? ` من ${c.usage_limit}` : ""} مرة
                    {c.expires_at ? ` · ينتهي ${formatDate(c.expires_at)}` : ""}
                    {!c.is_active ? " · معطّل" : ""}
                  </span>
                </span>
                <DeleteButton onDelete={deleteRow.bind(null, "coupons", c.id)} />
              </div>
              <EditDetails>
                <EntityForm action={saveCoupon}>
                  <CouponFields c={c} />
                </EntityForm>
              </EditDetails>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
