import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export const inputClass =
  "h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground placeholder:text-muted/70 outline-none transition focus:border-primary-strong focus:ring-2 focus:ring-primary/40 disabled:opacity-60 aria-[invalid=true]:border-danger";

export function Field({
  label,
  error,
  hint,
  children,
  htmlFor,
  className,
}: {
  label: string;
  error?: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(inputClass, "h-auto min-h-24 py-2.5", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(inputClass, "pe-8", className)} {...props} />;
}

export function FormMessage({ tone = "danger", children }: { tone?: "danger" | "success"; children: ReactNode }) {
  if (!children) return null;
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-3.5 py-2.5 text-sm",
        tone === "danger" ? "border-danger/30 bg-danger/10 text-danger" : "border-success/30 bg-success/10 text-success",
      )}
    >
      {children}
    </div>
  );
}
