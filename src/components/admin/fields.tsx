import type { ReactNode } from "react";
import { Field, Input, Select } from "@/components/ui/form";

type Base = { prefix: string; name: string; label: string; hint?: string; className?: string };

export function TextField({ prefix, name, label, defaultValue, ltr, hint, type = "text", className }: Base & { defaultValue?: string | number | null; ltr?: boolean; type?: string }) {
  const id = `${prefix}-${name}`;
  return (
    <Field label={label} htmlFor={id} hint={hint} className={className}>
      <Input id={id} name={name} type={type} defaultValue={defaultValue ?? ""} dir={ltr ? "ltr" : undefined} className={ltr ? "text-end" : undefined} />
    </Field>
  );
}

export function SelectField({ prefix, name, label, defaultValue, hint, className, children }: Base & { defaultValue?: string | number | null; children: ReactNode }) {
  const id = `${prefix}-${name}`;
  return (
    <Field label={label} htmlFor={id} hint={hint} className={className}>
      <Select id={id} name={name} defaultValue={defaultValue ?? ""}>
        {children}
      </Select>
    </Field>
  );
}

export function CheckField({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2.5 self-end pb-2.5 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-[var(--primary-strong)]" />
      {label}
    </label>
  );
}

/** A row's inline edit form, collapsed by default. */
export function EditDetails({ children }: { children: ReactNode }) {
  return (
    <details className="group">
      <summary className="cursor-pointer list-none rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary-strong hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
        تعديل
      </summary>
      <div className="mt-3 rounded-xl border border-border bg-background p-4">{children}</div>
    </details>
  );
}
