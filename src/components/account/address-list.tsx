"use client";

import { useState, useTransition } from "react";
import { MapPin, Plus, Star, Trash2 } from "lucide-react";
import { deleteAddress, setDefaultAddress } from "@/app/actions/account";
import { Button } from "@/components/ui/button";
import { AddressForm } from "./account-forms";

type Address = { id: number; label: string; recipient_name: string; phone: string; details: string; is_default: boolean; city: { name: string } | null };
type City = { id: number; name: string; delivery_fee: number };

export function AddressList({ addresses, cities }: { addresses: Address[]; cities: City[] }) {
  const [adding, setAdding] = useState(addresses.length === 0);
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-col gap-4">
      <ul className="grid gap-3 sm:grid-cols-2">
        {addresses.map((a) => (
          <li key={a.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold">
                <MapPin size={16} className="text-primary-strong" aria-hidden />
                {a.label}
              </span>
              {a.is_default && <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary-strong">الافتراضي</span>}
            </div>
            <p className="text-sm">{a.recipient_name}</p>
            <p className="num text-sm text-muted" dir="ltr" style={{ textAlign: "end" }}>{a.phone}</p>
            <p className="text-sm text-muted">
              {a.city?.name}، {a.details}
            </p>
            <div className="mt-1 flex gap-2">
              {!a.is_default && (
                <Button size="sm" variant="ghost" disabled={pending} onClick={() => start(() => setDefaultAddress(a.id))}>
                  <Star size={14} aria-hidden /> اجعله افتراضياً
                </Button>
              )}
              <Button size="sm" variant="ghost" className="text-danger" disabled={pending} onClick={() => start(() => deleteAddress(a.id))}>
                <Trash2 size={14} aria-hidden /> حذف
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {adding ? (
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-4 font-bold">عنوان جديد</h2>
          <AddressForm cities={cities} onDone={() => setAdding(false)} />
        </div>
      ) : (
        <Button variant="outline" onClick={() => setAdding(true)} className="self-start">
          <Plus size={16} aria-hidden /> إضافة عنوان
        </Button>
      )}
    </div>
  );
}
