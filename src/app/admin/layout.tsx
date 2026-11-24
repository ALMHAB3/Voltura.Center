import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { Logo } from "@/components/store/logo";
import { ThemeToggle } from "@/components/store/theme-toggle";

export const metadata: Metadata = { title: { default: "لوحة التحكم", template: "%s | لوحة التحكم" }, robots: { index: false } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  // Server-side role check on every admin page (the proxy only checks that someone is signed in).
  const { profile } = await requireAdmin();
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="min-w-0 bg-ink-gradient text-ink-foreground lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto">
        <div className="flex items-center justify-between gap-3 px-4 py-4">
          <Logo />
          <ThemeToggle className="flex size-9 items-center justify-center rounded-lg hover:bg-white/10" />
        </div>
        <div className="px-3 pb-3 lg:pb-6">
          <AdminNav />
        </div>
        <p className="hidden px-4 text-xs text-ink-muted lg:block">{profile?.full_name ?? "مدير المتجر"}</p>
      </aside>
      <main className="min-w-0 px-4 py-6 lg:px-8">{children}</main>
    </div>
  );
}
