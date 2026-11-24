import Link from "next/link";
import type { Category } from "@/lib/queries";
import { CategoryIcon } from "@/components/store/category-icon";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 lg:grid-cols-9">
      {categories.map((c) => (
        <li key={c.id}>
          <Link
            href={`/category/${c.slug}`}
            className="group flex h-full flex-col items-center gap-2.5 rounded-2xl border border-border bg-surface px-2 py-4 text-center transition hover:-translate-y-0.5 hover:border-primary-strong/50 hover:shadow-card"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-ink text-primary transition group-hover:bg-ink-2 sm:size-14">
              <CategoryIcon name={c.icon} size={24} strokeWidth={1.7} />
            </span>
            <span className="text-xs font-semibold leading-tight text-foreground sm:text-sm">{c.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
