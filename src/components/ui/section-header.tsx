import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  href,
  linkLabel = "عرض الكل",
  aside,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
  aside?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-semibold tracking-wide text-primary-strong">{eyebrow}</p>}
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        {aside}
        {href && (
          <Link href={href} className="flex items-center gap-1 text-sm font-semibold text-primary-strong hover:underline">
            {linkLabel}
            <ArrowLeft size={16} aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}
