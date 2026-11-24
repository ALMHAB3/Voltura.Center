"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import type { Brand, Category } from "@/lib/queries";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

type Facets = {
  brands: Brand[];
  specs: { key: string; values: { value: string; count: number }[] }[];
  priceMax: number;
};

const PRICE_PRESETS = [
  { label: "أقل من 500", min: undefined, max: 500 },
  { label: "500 – 1,500", min: 500, max: 1500 },
  { label: "1,500 – 3,000", min: 1500, max: 3000 },
  { label: "أكثر من 3,000", min: 3000, max: undefined },
];

/** URL-backed filter state. Controls update instantly (optimistic) while the new page loads. */
function useUrlParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, start] = useTransition();
  const [query, setQuery] = useOptimistic(searchParams.toString());
  const params = new URLSearchParams(query);

  function update(mutate: (p: URLSearchParams) => void) {
    const next = new URLSearchParams(query);
    mutate(next);
    next.delete("page");
    const qs = next.toString();
    start(() => {
      setQuery(qs);
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }
  return { params, update, pending, pathname };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-border py-4 last:border-0">
      <legend className="mb-3 text-sm font-bold text-foreground">{title}</legend>
      {children}
    </fieldset>
  );
}

function Check({ checked, onChange, label, count }: { checked: boolean; onChange: () => void; label: string; count?: number }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm hover:bg-surface-2">
      <input type="checkbox" checked={checked} onChange={onChange} className="size-4 accent-[var(--primary-strong)]" />
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="num text-xs text-muted">{count}</span>}
    </label>
  );
}

/** Remounted (via key) when the URL changes, so it always starts from the current values. */
function PriceRange({ initialMin, initialMax, placeholderMax, onApply }: { initialMin: string; initialMax: string; placeholderMax: number; onApply: (min: string, max: string) => void }) {
  const [min, setMin] = useState(initialMin);
  const [max, setMax] = useState(initialMax);
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onApply(min, max);
      }}
    >
      <label className="sr-only" htmlFor="price-min">
        من
      </label>
      <input
        id="price-min"
        inputMode="numeric"
        value={min}
        onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))}
        placeholder="من"
        className="num h-9 w-full min-w-0 rounded-lg border border-border bg-surface px-2 text-sm"
      />
      <label className="sr-only" htmlFor="price-max">
        إلى
      </label>
      <input
        id="price-max"
        inputMode="numeric"
        value={max}
        onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))}
        placeholder={placeholderMax ? String(placeholderMax) : "إلى"}
        className="num h-9 w-full min-w-0 rounded-lg border border-border bg-surface px-2 text-sm"
      />
      <Button type="submit" variant="ink" size="sm" className="shrink-0">
        تطبيق
      </Button>
    </form>
  );
}

function FilterBody({ facets, categories, activeCategory }: { facets: Facets; categories?: Category[]; activeCategory?: string }) {
  const { params, update, pathname } = useUrlParams();
  const brands = (params.get("brand") ?? "").split(",").filter(Boolean);
  const specs = params.getAll("spec");

  const toggle = (key: string, value = "1") =>
    update((p) => (p.get(key) === value ? p.delete(key) : p.set(key, value)));

  const hasFilters = ["brand", "min", "max", "stock", "offers", "spec", "q"].some((k) => params.has(k));

  return (
    <div>
      {hasFilters && (
        <Link href={pathname} className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-danger hover:underline">
          <X size={14} aria-hidden /> مسح كل الفلاتر
        </Link>
      )}

      <Section title="التوفر والعروض">
        <Check checked={params.get("stock") === "1"} onChange={() => toggle("stock")} label="المتوفر في المخزون فقط" />
        <Check checked={params.get("offers") === "1"} onChange={() => toggle("offers")} label="العروض والتخفيضات فقط" />
      </Section>

      {categories && categories.length > 0 && (
        <Section title="الأقسام">
          <ul className="flex flex-col gap-0.5 text-sm">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/category/${c.slug}`}
                  className={cn(
                    "block rounded-lg px-2 py-1.5 hover:bg-surface-2",
                    c.parent_id && "ps-5 text-muted",
                    activeCategory === c.slug && "bg-surface-2 font-semibold text-primary-strong",
                  )}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="السعر (د.ل)">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {PRICE_PRESETS.map((preset) => {
            const active =
              (params.get("min") ?? "") === (preset.min?.toString() ?? "") &&
              (params.get("max") ?? "") === (preset.max?.toString() ?? "");
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  update((p) => {
                    if (active) {
                      p.delete("min");
                      p.delete("max");
                      return;
                    }
                    if (preset.min) p.set("min", String(preset.min));
                    else p.delete("min");
                    if (preset.max) p.set("max", String(preset.max));
                    else p.delete("max");
                  })
                }
                className={cn(
                  "num rounded-lg border px-2.5 py-1 text-xs transition-colors",
                  active ? "border-ink bg-ink text-primary" : "border-border hover:border-primary-strong",
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <PriceRange key={`${params.get("min")}-${params.get("max")}`} initialMin={params.get("min") ?? ""} initialMax={params.get("max") ?? ""} placeholderMax={facets.priceMax} onApply={(min, max) =>
          update((p) => {
            if (min) p.set("min", min);
            else p.delete("min");
            if (max) p.set("max", max);
            else p.delete("max");
          })
        } />
      </Section>

      {facets.brands.length > 0 && (
        <Section title="الماركة">
          {facets.brands.map((b) => (
            <Check
              key={b.id}
              label={b.name}
              checked={brands.includes(b.slug)}
              onChange={() =>
                update((p) => {
                  const next = brands.includes(b.slug) ? brands.filter((x) => x !== b.slug) : [...brands, b.slug];
                  if (next.length) p.set("brand", next.join(","));
                  else p.delete("brand");
                })
              }
            />
          ))}
        </Section>
      )}

      {facets.specs.map((spec) => (
        <Section key={spec.key} title={spec.key}>
          {spec.values.map(({ value, count }) => {
            const token = `${spec.key}:${value}`;
            const checked = specs.includes(token);
            return (
              <Check
                key={value}
                label={value}
                count={count}
                checked={checked}
                onChange={() =>
                  update((p) => {
                    const others = specs.filter((s) => !s.startsWith(`${spec.key}:`));
                    p.delete("spec");
                    others.forEach((s) => p.append("spec", s));
                    if (!checked) p.append("spec", token);
                  })
                }
              />
            );
          })}
        </Section>
      ))}
    </div>
  );
}

export function Filters(props: { facets: Facets; categories?: Category[]; activeCategory?: string }) {
  return (
    <aside className="hidden w-64 shrink-0 lg:block" aria-label="التصفية">
      <div className="sticky top-32 max-h-[calc(100dvh-9rem)] overflow-y-auto rounded-2xl border border-border bg-surface px-4 py-2">
        <FilterBody {...props} />
      </div>
    </aside>
  );
}

export function MobileFilters(props: { facets: Facets; categories?: Category[]; activeCategory?: string; total: number }) {
  const [open, setOpen] = useState(false);
  const params = useSearchParams();
  const activeCount = ["brand", "min", "max", "stock", "offers"].filter((k) => params.has(k)).length + params.getAll("spec").length;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="lg:hidden">
        <SlidersHorizontal size={16} aria-hidden />
        التصفية
        {activeCount > 0 && (
          <span className="num flex size-5 items-center justify-center rounded-full bg-ink text-[11px] text-primary">{activeCount}</span>
        )}
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="التصفية">
          <button type="button" aria-label="إغلاق" className="absolute inset-0 bg-ink-3/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] animate-fade-in flex-col rounded-t-3xl bg-surface">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="font-bold">التصفية</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="إغلاق" className="flex size-10 items-center justify-center rounded-xl hover:bg-surface-2">
                <X size={20} aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4">
              <FilterBody {...props} />
            </div>
            <div className="border-t border-border p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <Button className="w-full" onClick={() => setOpen(false)}>
                عرض <span className="num">{props.total}</span> منتج
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function SortSelect({ sorts, current }: { sorts: Record<string, string>; current: string }) {
  const { update } = useUrlParams();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-muted sm:inline">ترتيب:</span>
      <select
        value={current}
        onChange={(e) => update((p) => (e.target.value === "newest" ? p.delete("sort") : p.set("sort", e.target.value)))}
        className="h-9 rounded-xl border border-border bg-surface px-2.5 text-sm"
        aria-label="ترتيب المنتجات"
      >
        {Object.entries(sorts).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ViewToggle({ view }: { view: "grid" | "list" }) {
  const { update } = useUrlParams();
  return (
    <div className="hidden items-center rounded-xl border border-border bg-surface p-0.5 sm:flex" role="group" aria-label="طريقة العرض">
      {(["grid", "list"] as const).map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={view === v}
          onClick={() => update((p) => (v === "grid" ? p.delete("view") : p.set("view", v)))}
          className={cn("rounded-lg px-2.5 py-1.5 text-xs font-semibold", view === v ? "bg-ink text-primary" : "text-muted hover:text-foreground")}
        >
          {v === "grid" ? "شبكة" : "قائمة"}
        </button>
      ))}
    </div>
  );
}
