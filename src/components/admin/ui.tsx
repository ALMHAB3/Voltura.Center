import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function AdminPageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "success" | "danger" | "warning" }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p
        className={cn(
          "num mt-1.5 text-2xl font-bold",
          tone === "success" && "text-success",
          tone === "danger" && "text-danger",
          tone === "warning" && "text-warning",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Panel({ title, children, className, actions }: { title?: string; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-border bg-surface", className)}>
      {title && (
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-bold">{title}</h2>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm [&_td]:px-4 [&_td]:py-3 [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-start [&_th]:text-xs [&_th]:font-semibold [&_th]:text-muted [&_thead]:bg-surface-2 [&_tbody_tr]:border-t [&_tbody_tr]:border-border">
        {children}
      </table>
    </div>
  );
}
