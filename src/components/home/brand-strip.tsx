import Link from "next/link";
import type { Brand } from "@/lib/queries";

export function BrandStrip({ brands }: { brands: Brand[] }) {
  return (
    <ul className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 lg:grid-cols-8">
      {brands.map((b) => (
        <li key={b.id} className="shrink-0">
          <Link
            href={`/products?brand=${b.slug}`}
            className="flex h-16 min-w-28 items-center justify-center rounded-2xl border border-border bg-surface px-4 text-base font-bold tracking-wide text-foreground/80 transition hover:border-primary-strong/50 hover:text-primary-strong"
          >
            {b.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
