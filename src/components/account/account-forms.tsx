"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { addressSchema, profileSchema } from "@/lib/validation";
import { saveAddress, updateProfile } from "@/app/actions/account";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input, Select, Textarea } from "@/components/ui/form";
import { formatPrice } from "@/lib/format";

export function ProfileForm({ defaults, email }: { defaults: { fullName: string; phone: string }; email: string }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const { register, handleSubmit, formState } = useForm<z.input<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaults,
  });
  return (
    <form noValidate onSubmit={handleSubmit((v) => start(async () => setResult(await updateProfile(v))))} className="grid max-w-xl gap-4">
      <Field label="البريد الإلكتروني" htmlFor="p-email" hint="لا يمكن تغيير البريد من هنا">
        <Input id="p-email" value={email} disabled dir="ltr" className="text-end" />
      </Field>
      <Field label="الاسم الكامل" htmlFor="p-name" error={formState.errors.fullName?.message}>
        <Input id="p-name" {...register("fullName")} />
      </Field>
      <Field label="رقم الهاتف" htmlFor="p-phone" error={formState.errors.phone?.message}>
        <Input id="p-phone" type="tel" dir="ltr" className="num text-end" {...register("phone")} />
      </Field>
      {result && <FormMessage tone={result.ok ? "success" : "danger"}>{result.message}</FormMessage>}
      <Button type="submit" disabled={pending} className="justify-self-start">
        حفظ التغييرات
      </Button>
    </form>
  );
}

type City = { id: number; name: string; delivery_fee: number };

export function AddressForm({ cities, onDone }: { cities: City[]; onDone?: () => void }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const { register, handleSubmit, formState, reset } = useForm<z.input<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: { label: "المنزل", isDefault: false },
  });
  const e = formState.errors;
  return (
    <form
      noValidate
      onSubmit={handleSubmit((v) =>
        start(async () => {
          const r = await saveAddress(v);
          setResult(r);
          if (r.ok) {
            reset();
            onDone?.();
          }
        }),
      )}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      <Field label="اسم العنوان" htmlFor="a-label" error={e.label?.message}>
        <Input id="a-label" placeholder="المنزل، العمل…" {...register("label")} />
      </Field>
      <Field label="اسم المستلم" htmlFor="a-name" error={e.recipientName?.message}>
        <Input id="a-name" {...register("recipientName")} />
      </Field>
      <Field label="رقم الهاتف" htmlFor="a-phone" error={e.phone?.message}>
        <Input id="a-phone" type="tel" dir="ltr" placeholder="0912345678" className="num text-end" {...register("phone")} />
      </Field>
      <Field label="المدينة" htmlFor="a-city" error={e.cityId?.message}>
        <Select id="a-city" {...register("cityId")}>
          <option value="">اختر المدينة</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — {formatPrice(c.delivery_fee)}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="العنوان بالتفصيل" htmlFor="a-details" error={e.details?.message} className="sm:col-span-2">
        <Textarea id="a-details" rows={2} {...register("details")} />
      </Field>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" className="size-4 accent-[var(--primary-strong)]" {...register("isDefault")} />
        اجعله العنوان الافتراضي
      </label>
      {result && (
        <div className="sm:col-span-2">
          <FormMessage tone={result.ok ? "success" : "danger"}>{result.message}</FormMessage>
        </div>
      )}
      <Button type="submit" disabled={pending} className="justify-self-start">
        حفظ العنوان
      </Button>
    </form>
  );
}
