import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/account/auth-shell";
import { ForgotPasswordForm } from "@/components/account/auth-forms";

export const metadata: Metadata = { title: "نسيت كلمة المرور", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="نسيت كلمة المرور؟"
      subtitle="أدخل بريدك وسنرسل لك رابطاً لتعيين كلمة مرور جديدة."
      footer={
        <Link href="/account/login" className="font-semibold text-primary-strong">
          العودة لتسجيل الدخول
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
