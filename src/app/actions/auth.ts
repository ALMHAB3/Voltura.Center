"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { emailSchema, loginSchema, newPasswordSchema, registerSchema } from "@/lib/validation";
import { site } from "@/lib/site";

type Result = { ok: boolean; message?: string };

function safeNext(next: unknown) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : site.url;
}

export async function signIn(input: unknown, next?: string): Promise<Result> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return {
      ok: false,
      message: error.code === "email_not_confirmed" ? "أكّد بريدك الإلكتروني أولاً من الرسالة التي أرسلناها" : "البريد أو كلمة المرور غير صحيحة",
    };
  }
  revalidatePath("/", "layout");
  redirect(safeNext(next));
}

export async function signUp(input: unknown, next?: string): Promise<Result> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const { email, password, fullName, phone } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone },
      emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(safeNext(next))}`,
    },
  });
  if (error) {
    return { ok: false, message: error.code === "user_already_exists" ? "هذا البريد مسجّل مسبقاً، سجّل دخولك" : "تعذّر إنشاء الحساب، حاول مرة أخرى" };
  }
  if (!data.session) return { ok: true, message: "أرسلنا رسالة تأكيد إلى بريدك. افتحها لتفعيل الحساب." };
  revalidatePath("/", "layout");
  redirect(safeNext(next));
}

export async function sendPasswordReset(input: unknown): Promise<Result> {
  const parsed = emailSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await origin()}/auth/callback?next=/account/reset-password`,
  });
  // Same answer whether or not the email exists.
  return { ok: true, message: "إذا كان البريد مسجّلاً لدينا فستصلك رسالة فيها رابط لتعيين كلمة مرور جديدة." };
}

export async function updatePassword(input: unknown): Promise<Result> {
  const parsed = newPasswordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, message: "انتهت صلاحية الرابط. اطلب رابطاً جديداً." };
  redirect("/account?password=updated");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
