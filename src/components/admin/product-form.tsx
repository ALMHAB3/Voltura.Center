"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { productSchema, type ProductFormValues } from "@/lib/admin-schemas";
import { saveProduct } from "@/app/actions/admin";
import { discountedPrice, formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input, Select, Textarea } from "@/components/ui/form";
import { toast } from "@/components/ui/toaster";
import { ImageUploader } from "./image-uploader";
import { Panel } from "./ui";

type Option = { id: number; name: string; parent_id?: number | null };

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\x00-\x7F]/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function ProductForm({
  id,
  defaults,
  categories,
  brands,
}: {
  id: number | null;
  defaults: ProductFormValues;
  categories: Option[];
  brands: Option[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<ProductFormValues>({ resolver: zodResolver(productSchema), defaultValues: defaults });
  const { register, control, handleSubmit, formState, setValue, getValues } = form;
  const specs = useFieldArray({ control, name: "specs" });
  const price = Number(useWatch({ control, name: "price" })) || 0;
  const percent = Number(useWatch({ control, name: "discountPercent" })) || 0;
  const cost = Number(useWatch({ control, name: "costPrice" })) || 0;
  const sale = discountedPrice(price, percent);
  const e = formState.errors;

  const onSubmit = handleSubmit((values) =>
    start(async () => {
      setError(null);
      // datetime-local is in the admin's local time; send an absolute timestamp.
      const r = await saveProduct(id, { ...values, offerEndsAt: values.offerEndsAt ? new Date(values.offerEndsAt).toISOString() : "" });
      if (!r.ok) return setError(r.message);
      toast(r.message);
      if (!id && r.id) router.replace(`/admin/products/${r.id}`);
      else router.refresh();
    }),
  );

  const roots = categories.filter((c) => !c.parent_id);

  return (
    <form onSubmit={onSubmit} noValidate className="grid items-start gap-6 xl:grid-cols-[1.6fr_1fr]">
      <div className="flex flex-col gap-6">
        <Panel title="بيانات المنتج">
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <Field label="اسم المنتج" htmlFor="name" error={e.name?.message} className="sm:col-span-2">
              <Input
                id="name"
                {...register("name", {
                  onBlur: (ev) => {
                    if (!getValues("slug")) setValue("slug", slugify(ev.target.value));
                  },
                })}
              />
            </Field>
            <Field label="الرابط (slug)" htmlFor="slug" error={e.slug?.message} hint="يظهر في عنوان الصفحة: /product/الرابط">
              <Input id="slug" dir="ltr" className="text-end" {...register("slug")} />
            </Field>
            <Field label="رمز المنتج SKU" htmlFor="sku" error={e.sku?.message}>
              <Input id="sku" dir="ltr" className="text-end" {...register("sku")} />
            </Field>
            <Field label="القسم" htmlFor="categoryId" error={e.categoryId?.message}>
              <Select id="categoryId" {...register("categoryId")}>
                <option value="">اختر القسم</option>
                {roots.map((root) => (
                  <optgroup key={root.id} label={root.name}>
                    <option value={root.id}>{root.name}</option>
                    {categories
                      .filter((c) => c.parent_id === root.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          — {c.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </Select>
            </Field>
            <Field label="الماركة" htmlFor="brandId">
              <Select id="brandId" {...register("brandId")}>
                <option value="">بدون</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="الوصف" htmlFor="description" className="sm:col-span-2">
              <Textarea id="description" rows={5} {...register("description")} />
            </Field>
          </div>
        </Panel>

        <Panel title="الصور">
          <div className="p-4">
            <Controller
              control={control}
              name="images"
              render={({ field }) => (
                <ImageUploader folder="products" value={field.value.map((i) => i.path)} onChange={(paths) => field.onChange(paths.map((path) => ({ path })))} />
              )}
            />
          </div>
        </Panel>

        <Panel title="المواصفات" actions={<Button size="sm" variant="outline" onClick={() => specs.append({ key: "", value: "" })}><Plus size={14} aria-hidden /> إضافة</Button>}>
          <div className="flex flex-col gap-2 p-4">
            {specs.fields.length === 0 && <p className="text-sm text-muted">مثال: المعالج = Core i5، الرام = 16GB. المواصفات تظهر كفلاتر في صفحة القسم.</p>}
            {specs.fields.map((f, i) => (
              <div key={f.id} className="flex gap-2">
                <label className="sr-only" htmlFor={`spec-k-${i}`}>الخاصية</label>
                <Input id={`spec-k-${i}`} placeholder="الخاصية" {...register(`specs.${i}.key`)} />
                <label className="sr-only" htmlFor={`spec-v-${i}`}>القيمة</label>
                <Input id={`spec-v-${i}`} placeholder="القيمة" {...register(`specs.${i}.value`)} />
                <Button variant="ghost" size="icon" onClick={() => specs.remove(i)} aria-label="حذف">
                  <X size={16} aria-hidden />
                </Button>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="flex flex-col gap-6 xl:sticky xl:top-6">
        <Panel title="السعر والمخزون">
          <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-1">
            <Field label="السعر (د.ل)" htmlFor="price" error={e.price?.message}>
              <Input id="price" inputMode="numeric" className="num" {...register("price")} />
            </Field>
            <Field label="نسبة الخصم %" htmlFor="discountPercent" error={e.discountPercent?.message}>
              <Input id="discountPercent" inputMode="numeric" className="num" {...register("discountPercent")} />
            </Field>
            <div className="rounded-xl bg-surface-2 p-3 text-sm sm:col-span-2 xl:col-span-1">
              <p className="text-muted">سعر البيع بعد التقريب لأعلى إلى أقرب 5:</p>
              <p className="num mt-1 text-xl font-bold">{formatPrice(sale)}</p>
              {percent > 0 && price > 0 && (
                <p className="num mt-1 text-xs text-muted">
                  {price} × {100 - percent}% = {((price * (100 - percent)) / 100).toFixed(1).replace(/\.0$/, "")} ← {sale}
                </p>
              )}
              {cost > 0 && <p className={`num mt-1 text-xs font-semibold ${sale - cost >= 0 ? "text-success" : "text-danger"}`}>الربح للقطعة: {formatPrice(sale - cost)}</p>}
            </div>
            <Field label="سعر التكلفة (لحساب الأرباح)" htmlFor="costPrice" hint="لا يظهر للعملاء">
              <Input id="costPrice" inputMode="numeric" className="num" {...register("costPrice")} />
            </Field>
            <Field label="ينتهي العرض في (اختياري)" htmlFor="offerEndsAt" hint="يظهر عدّاد تنازلي في صفحة المنتج">
              <Input id="offerEndsAt" type="datetime-local" {...register("offerEndsAt")} />
            </Field>
            <Field label="الكمية في المخزون" htmlFor="stock" error={e.stock?.message}>
              <Input id="stock" inputMode="numeric" className="num" {...register("stock")} />
            </Field>
            <Field label="الضمان (شهر)" htmlFor="warrantyMonths">
              <Input id="warrantyMonths" inputMode="numeric" className="num" {...register("warrantyMonths")} />
            </Field>
          </div>
        </Panel>
        <Panel title="الظهور">
          <div className="flex flex-col gap-3 p-4 text-sm">
            <label className="flex items-center gap-2.5">
              <input type="checkbox" className="size-4 accent-[var(--primary-strong)]" {...register("isActive")} />
              ظاهر في المتجر
            </label>
            <label className="flex items-center gap-2.5">
              <input type="checkbox" className="size-4 accent-[var(--primary-strong)]" {...register("isFeatured")} />
              منتج مميز (يظهر في الرئيسية)
            </label>
          </div>
        </Panel>
        <FormMessage>{error}</FormMessage>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "جارِ الحفظ…" : id ? "حفظ التعديلات" : "إضافة المنتج"}
        </Button>
      </div>
    </form>
  );
}
