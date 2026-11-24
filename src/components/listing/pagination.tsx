import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function Pagination({
  page,
  pages,
  basePath,
  searchParams,
}: {
  page: number;
  pages: number;
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (pages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (k === "page" || v === undefined) continue;
      (Array.isArray(v) ? v : [v]).forEach((x) => params.append(k, x));
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const numbers = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 1,
  );

  const item = "num flex size-10 items-center justify-center rounded-xl border text-sm font-semibold transition-colors";

  return (
    <nav aria-label="الصفحات" className="mt-8 flex items-center justify-center gap-1.5">
      {page > 1 && (
        <Link href={href(page - 1)} aria-label="الصفحة السابقة" className={cn(item, "border-border bg-surface hover:border-primary-strong")}>
          <ChevronRight size={18} aria-hidden />
        </Link>
      )}
      {numbers.map((n, i) => (
        <span key={n} className="flex items-center gap-1.5">
          {i > 0 && numbers[i - 1] !== n - 1 && <span className="text-muted">…</span>}
          <Link
            href={href(n)}
            aria-current={n === page ? "page" : undefined}
            className={cn(
              item,
              n === page ? "border-ink bg-ink text-primary" : "border-border bg-surface hover:border-primary-strong",
            )}
          >
            {n}
          </Link>
        </span>
      ))}
      {page < pages && (
        <Link href={href(page + 1)} aria-label="الصفحة التالية" className={cn(item, "border-border bg-surface hover:border-primary-strong")}>
          <ChevronLeft size={18} aria-hidden />
        </Link>
      )}
    </nav>
  );
}
