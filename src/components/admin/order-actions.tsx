"use client";

import { useTransition } from "react";
import { Truck } from "lucide-react";
import { sendToVanex, updateOrder } from "@/app/actions/admin";
import { orderStatuses } from "@/lib/site";
import { EntityForm } from "./entity-form";
import { Field, Input, Select } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";

export function OrderStatusForm({ id, status, tracking }: { id: string; status: string; tracking: string | null }) {
  return (
    <EntityForm action={updateOrder} submitLabel="حفظ الحالة">
      <input type="hidden" name="id" value={id} />
      <Field label="حالة الطلب" htmlFor="status" hint="الإلغاء يعيد الكميات إلى المخزون تلقائياً">
        <Select id="status" name="status" defaultValue={status}>
          {Object.entries(orderStatuses).map(([key, s]) => (
            <option key={key} value={key}>
              {s.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="رقم تتبع الشحنة (Vanex)" htmlFor="vanexTracking">
        <Input id="vanexTracking" name="vanexTracking" defaultValue={tracking ?? ""} dir="ltr" className="text-end" />
      </Field>
    </EntityForm>
  );
}

export function VanexButton({ id, configured }: { id: string; configured: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-col gap-1.5">
      <Button
        variant="outline"
        disabled={!configured || pending}
        onClick={() =>
          start(async () => {
            const r = await sendToVanex(id);
            toast(r.message, r.ok ? "success" : "danger");
          })
        }
      >
        <Truck size={16} aria-hidden /> إنشاء شحنة في Vanex
      </Button>
      {!configured && <p className="text-xs text-muted">يتفعّل بعد إضافة مفتاح Vanex في إعدادات الخادم.</p>}
    </div>
  );
}
