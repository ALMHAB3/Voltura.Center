"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form";
import type { ActionResult } from "@/app/actions/admin";

/** Server-action form with a result message. Fields are passed as children. */
export function EntityForm({
  action,
  children,
  submitLabel = "حفظ",
  resetOnSuccess = false,
}: {
  action: (state: ActionResult | null, fd: FormData) => Promise<ActionResult>;
  children: ReactNode;
  submitLabel?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <form ref={ref} action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {children}
      {state && (
        <div className="sm:col-span-2">
          <FormMessage tone={state.ok ? "success" : "danger"}>{state.message}</FormMessage>
        </div>
      )}
      <Button type="submit" disabled={pending} className="justify-self-start">
        {pending ? "جارِ الحفظ…" : submitLabel}
      </Button>
    </form>
  );
}
