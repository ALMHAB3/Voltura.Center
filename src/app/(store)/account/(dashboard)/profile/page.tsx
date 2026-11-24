import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { ProfileForm } from "@/components/account/account-forms";

export const metadata: Metadata = { title: "بياناتي", robots: { index: false } };

export default async function ProfilePage() {
  const { user, profile } = await requireUser("/account/profile");
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">بياناتي</h1>
      <div className="rounded-2xl border border-border bg-surface p-5">
        <ProfileForm email={user.email ?? ""} defaults={{ fullName: profile?.full_name ?? "", phone: profile?.phone ?? "" }} />
      </div>
      <p className="text-sm text-muted">
        لتغيير كلمة المرور:{" "}
        <Link href="/account/forgot-password" className="font-semibold text-primary-strong">
          أرسل رابط إعادة التعيين إلى بريدك
        </Link>
      </p>
    </section>
  );
}
