import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("flex shrink-0 items-center gap-2.5", className)} aria-label={`${site.name} — الرئيسية`}>
      <Image src="/brand/logo-mark.png" alt="" width={458} height={420} priority className="h-9 w-auto sm:h-10" />
      {!compact && (
        <Image src="/brand/logo-word.png" alt={site.name} width={532} height={48} priority className="hidden h-3.5 w-auto sm:block lg:h-4" />
      )}
    </Link>
  );
}
