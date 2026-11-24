import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthShell } from "@/components/account/auth-shell";
import { LoginForm } from "@/components/account/auth-forms";
import { FormMessage } from "@/components/ui/form";

export const metadata: Metadata = { title: "تسجيل الدخول", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/account/login">) {
  const { next, error } = await searchParams;
  const target = typeof next === "string" ? next : "/account";
  if (await getCurrentUser()) redirect(target);
  return (
    <AuthShell
      title="مرحباً بعودتك"
      subtitle="سجّل دخولك لمتابعة طلباتك وعناوينك ومفضلتك."
      footer={
        <>
          ليس لديك حساب؟{" "}
          <Link href={`/account/register?next=${encodeURIComponent(target)}`} className="font-semibold text-primary-strong">
            أنشئ حساباً
          </Link>
        </>
      }
    >
      {error === "link" && (
        <div className="mb-4">
          <FormMessage>الرابط غير صالح أو انتهت صلاحيته. حاول مرة أخرى.</FormMessage>
        </div>
      )}
      <LoginForm next={target} />
    </AuthShell>
  );
}
