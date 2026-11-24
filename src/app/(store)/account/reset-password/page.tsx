import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { AuthShell } from "@/components/account/auth-shell";
import { ResetPasswordForm } from "@/components/account/auth-forms";

export const metadata: Metadata = { title: "كلمة مرور جديدة", robots: { index: false } };

export default async function ResetPasswordPage() {
  await requireUser("/account/reset-password");
  return (
    <AuthShell title="تعيين كلمة مرور جديدة">
      <ResetPasswordForm />
    </AuthShell>
  );
}
