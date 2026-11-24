import { requireUser } from "@/lib/auth";
import { AccountNav } from "@/components/account/account-nav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const { profile, user, isAdmin } = await requireUser("/account");
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 lg:px-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-ink text-lg font-bold text-primary">
          {(profile?.full_name ?? user.email ?? "؟").trim().charAt(0)}
        </span>
        <div>
          <p className="text-xs text-muted">مرحباً</p>
          <p className="text-lg font-bold">{profile?.full_name ?? user.email}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <aside>
          <AccountNav isAdmin={isAdmin} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
