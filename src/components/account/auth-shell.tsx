import Image from "next/image";
import type { ReactNode } from "react";
import { BadgeCheck, Truck, Wallet } from "lucide-react";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="mx-auto grid grid-cols-1 max-w-5xl gap-0 overflow-hidden px-4 pt-8 lg:grid-cols-2 lg:px-6">
      <div className="hidden flex-col justify-between rounded-s-3xl bg-ink-gradient p-10 text-ink-foreground lg:flex">
        <Image src="/brand/logo-full.png" alt="" width={532} height={485} className="h-32 w-auto self-start" />
        <div>
          <p className="text-2xl font-bold leading-snug">كل ما تحتاجه من التقنية في مكان واحد</p>
          <ul className="mt-6 flex flex-col gap-3 text-sm text-ink-muted">
            <li className="flex items-center gap-2.5"><Truck size={18} className="text-primary" aria-hidden /> توصيل لكل المدن الليبية</li>
            <li className="flex items-center gap-2.5"><BadgeCheck size={18} className="text-primary" aria-hidden /> منتجات أصلية بضمان</li>
            <li className="flex items-center gap-2.5"><Wallet size={18} className="text-primary" aria-hidden /> كاش، حوالة، ون باي أو LyPay</li>
          </ul>
        </div>
      </div>
      <div className="rounded-3xl border border-border bg-surface p-6 sm:p-10 lg:rounded-s-none">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 border-t border-border pt-5 text-center text-sm text-muted">{footer}</div>}
      </div>
    </div>
  );
}
