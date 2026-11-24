import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthShell } from "@/components/account/auth-shell";
import { RegisterForm } from "@/components/account/auth-forms";

export const metadata: Metadata = { title: "إنشاء حساب", robots: { index: false } };

export default async function RegisterPage({ searchParams }: PageProps<"/account/register">) {
  const { next } = await searchParams;
  const target = typeof next === "string" ? next : "/account";
  if (await getCurrentUser()) redirect(target);
  return (
    <AuthShell
      title="إنشاء حساب جديد"
      subtitle="احفظ عناوينك، تابع طلباتك، وقيّم مشترياتك."
      footer={
        <>
          لديك حساب؟{" "}
          <Link href={`/account/login?next=${encodeURIComponent(target)}`} className="font-semibold text-primary-strong">
            سجّل دخولك
          </Link>
        </>
      }
    >
      <RegisterForm next={target} />
    </AuthShell>
  );
}
