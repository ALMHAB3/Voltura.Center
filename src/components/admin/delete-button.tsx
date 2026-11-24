"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import type { ActionResult } from "@/app/actions/admin";

/** Two-step delete: first click asks, second click deletes. */
export function DeleteButton({ onDelete, redirectTo }: { onDelete: () => Promise<ActionResult>; redirectTo?: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={pending}
      onBlur={() => setConfirming(false)}
      onClick={() => {
        if (!confirming) return setConfirming(true);
        start(async () => {
          const r = await onDelete();
          toast(r.message, r.ok ? "success" : "danger");
          setConfirming(false);
          if (r.ok && redirectTo) router.push(redirectTo);
          else router.refresh();
        });
      }}
      className={
        confirming
          ? "inline-flex items-center gap-1 rounded-lg bg-danger px-2.5 py-1.5 text-xs font-semibold text-white"
          : "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-danger hover:bg-danger/10"
      }
    >
      <Trash2 size={14} aria-hidden />
      {confirming ? "تأكيد الحذف" : "حذف"}
    </button>
  );
}
