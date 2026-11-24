import type { ReactNode } from "react";
import { Breadcrumbs } from "./breadcrumbs";

export function ProsePage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-5 lg:px-6">
      <Breadcrumbs items={[{ label: title }]} />
      <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
      {intro && <p className="mt-2 text-muted">{intro}</p>}
      <div className="mt-6 flex flex-col gap-6 rounded-3xl border border-border bg-surface p-5 text-[15px] leading-8 sm:p-8 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_li]:ms-5 [&_li]:list-disc [&_p]:text-foreground/85">
        {children}
      </div>
    </div>
  );
}
