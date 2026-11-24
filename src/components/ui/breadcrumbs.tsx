import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ label: "الرئيسية", href: "/" }, ...items];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: c.href } : {}),
    })),
  };
  return (
    <nav aria-label="مسار الصفحة" className="mb-4 text-sm">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ol className="flex flex-wrap items-center gap-1 text-muted">
        {all.map((c, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronLeft size={14} aria-hidden />}
            {c.href && i < all.length - 1 ? (
              <Link href={c.href} className="hover:text-primary-strong">
                {c.label}
              </Link>
            ) : (
              <span className="line-clamp-1 font-medium text-foreground" aria-current="page">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
