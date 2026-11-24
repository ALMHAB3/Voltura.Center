"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trackSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";

type Values = z.input<typeof trackSchema>;

export function TrackForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { register, handleSubmit, formState } = useForm<Values>({
    resolver: zodResolver(trackSchema),
    defaultValues: { orderNumber: params.get("order") ?? "VC-", phone: params.get("phone") ?? "" },
  });
  return (
    <form
      noValidate
      onSubmit={handleSubmit((v) => {
        const parsed = trackSchema.parse(v);
        router.push(`/track?order=${encodeURIComponent(parsed.orderNumber.toUpperCase())}&phone=${parsed.phone}`);
      })}
      className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
    >
      <Field label="رقم الطلب" htmlFor="orderNumber" error={formState.errors.orderNumber?.message}>
        <Input id="orderNumber" dir="ltr" className="num text-end uppercase" {...register("orderNumber")} />
      </Field>
      <Field label="رقم الهاتف المستخدم في الطلب" htmlFor="track-phone" error={formState.errors.phone?.message}>
        <Input id="track-phone" type="tel" dir="ltr" placeholder="0912345678" className="num text-end" {...register("phone")} />
      </Field>
      <Button type="submit" variant="ink" className="sm:mb-0">
        تتبع الطلب
      </Button>
    </form>
  );
}
