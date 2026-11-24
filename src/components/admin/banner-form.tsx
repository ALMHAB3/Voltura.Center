"use client";

import { useState } from "react";
import { saveBanner } from "@/app/actions/admin";
import { EntityForm } from "./entity-form";
import { ImageUploader } from "./image-uploader";
import { Field, Input } from "@/components/ui/form";

type Banner = { id: number; title: string; subtitle: string | null; image_path: string; link_url: string | null; button_label: string | null; sort_order: number; is_active: boolean };

export function BannerForm({ banner }: { banner?: Banner }) {
  const [image, setImage] = useState<string[]>(banner ? [banner.image_path] : []);
  const p = banner ? `bn${banner.id}` : "bnnew";
  return (
    <EntityForm action={saveBanner} submitLabel={banner ? "حفظ" : "إضافة البانر"}>
      {banner && <input type="hidden" name="id" value={banner.id} />}
      <input type="hidden" name="imagePath" value={image[0] ?? ""} />
      <div className="sm:col-span-2">
        <p className="mb-1.5 text-sm font-medium">الصورة (يفضّل 1600×640)</p>
        <ImageUploader folder="banners" multiple={false} value={image} onChange={setImage} />
      </div>
      <Field label="العنوان" htmlFor={`${p}-title`}>
        <Input id={`${p}-title`} name="title" defaultValue={banner?.title} />
      </Field>
      <Field label="النص الفرعي" htmlFor={`${p}-subtitle`}>
        <Input id={`${p}-subtitle`} name="subtitle" defaultValue={banner?.subtitle ?? ""} />
      </Field>
      <Field label="الرابط عند الضغط" htmlFor={`${p}-link`} hint="مثل /category/laptops">
        <Input id={`${p}-link`} name="linkUrl" dir="ltr" className="text-end" defaultValue={banner?.link_url ?? ""} />
      </Field>
      <Field label="نص الزر" htmlFor={`${p}-btn`}>
        <Input id={`${p}-btn`} name="buttonLabel" defaultValue={banner?.button_label ?? ""} />
      </Field>
      <Field label="الترتيب" htmlFor={`${p}-sort`}>
        <Input id={`${p}-sort`} name="sortOrder" type="number" defaultValue={banner?.sort_order ?? 0} />
      </Field>
      <label className="flex items-center gap-2.5 self-end pb-2.5 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={banner?.is_active ?? true} className="size-4 accent-[var(--primary-strong)]" />
        ظاهر
      </label>
    </EntityForm>
  );
}
