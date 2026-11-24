"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2 } from "lucide-react";
import { emailSchema, loginSchema, newPasswordSchema, registerSchema } from "@/lib/validation";
import { sendPasswordReset, signIn, signUp, updatePassword } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input } from "@/components/ui/form";

function useAction() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message?: string } | null>(null);
  const run = (fn: () => Promise<{ ok: boolean; message?: string } | undefined | void>) =>
    start(async () => {
      const r = await fn();
      if (r) setResult(r);
    });
  return { pending, result, run };
}

function GoogleButton({ next }: { next: string }) {
  if (process.env.NEXT_PUBLIC_GOOGLE_AUTH !== "true") return null;
  return (
    <>
      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() =>
          createClient().auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
          })
        }
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </svg>
        المتابعة باستخدام Google
      </Button>
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" /> أو <span className="h-px flex-1 bg-border" />
      </div>
    </>
  );
}

export function LoginForm({ next }: { next: string }) {
  const { pending, result, run } = useAction();
  const { register, handleSubmit, formState } = useForm<z.input<typeof loginSchema>>({ resolver: zodResolver(loginSchema) });
  return (
    <form noValidate onSubmit={handleSubmit((v) => run(() => signIn(v, next)))} className="flex flex-col gap-4">
      <GoogleButton next={next} />
      <Field label="البريد الإلكتروني" htmlFor="email" error={formState.errors.email?.message}>
        <Input id="email" type="email" dir="ltr" autoComplete="email" className="text-end" {...register("email")} />
      </Field>
      <Field label="كلمة المرور" htmlFor="password" error={formState.errors.password?.message}>
        <Input id="password" type="password" dir="ltr" autoComplete="current-password" className="text-end" {...register("password")} />
      </Field>
      <Link href="/account/forgot-password" className="-mt-2 self-start text-sm font-semibold text-primary-strong hover:underline">
        نسيت كلمة المرور؟
      </Link>
      {result && !result.ok && <FormMessage>{result.message}</FormMessage>}
      <Button type="submit" size="lg" disabled={pending}>
        {pending && <Loader2 size={18} className="animate-spin" aria-hidden />}
        تسجيل الدخول
      </Button>
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const { pending, result, run } = useAction();
  const { register, handleSubmit, formState } = useForm<z.input<typeof registerSchema>>({ resolver: zodResolver(registerSchema) });
  const e = formState.errors;
  if (result?.ok) return <FormMessage tone="success">{result.message}</FormMessage>;
  return (
    <form noValidate onSubmit={handleSubmit((v) => run(() => signUp(v, next)))} className="flex flex-col gap-4">
      <GoogleButton next={next} />
      <Field label="الاسم الكامل" htmlFor="fullName" error={e.fullName?.message}>
        <Input id="fullName" autoComplete="name" {...register("fullName")} />
      </Field>
      <Field label="رقم الهاتف" htmlFor="reg-phone" error={e.phone?.message}>
        <Input id="reg-phone" type="tel" dir="ltr" placeholder="0912345678" className="num text-end" autoComplete="tel" {...register("phone")} />
      </Field>
      <Field label="البريد الإلكتروني" htmlFor="reg-email" error={e.email?.message}>
        <Input id="reg-email" type="email" dir="ltr" autoComplete="email" className="text-end" {...register("email")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="كلمة المرور" htmlFor="reg-password" error={e.password?.message}>
          <Input id="reg-password" type="password" dir="ltr" autoComplete="new-password" className="text-end" {...register("password")} />
        </Field>
        <Field label="تأكيد كلمة المرور" htmlFor="reg-confirm" error={e.confirm?.message}>
          <Input id="reg-confirm" type="password" dir="ltr" autoComplete="new-password" className="text-end" {...register("confirm")} />
        </Field>
      </div>
      {result && !result.ok && <FormMessage>{result.message}</FormMessage>}
      <Button type="submit" size="lg" disabled={pending}>
        {pending && <Loader2 size={18} className="animate-spin" aria-hidden />}
        إنشاء الحساب
      </Button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const { pending, result, run } = useAction();
  const { register, handleSubmit, formState } = useForm<z.input<typeof emailSchema>>({ resolver: zodResolver(emailSchema) });
  return (
    <form noValidate onSubmit={handleSubmit((v) => run(() => sendPasswordReset(v)))} className="flex flex-col gap-4">
      <Field label="البريد الإلكتروني" htmlFor="forgot-email" error={formState.errors.email?.message}>
        <Input id="forgot-email" type="email" dir="ltr" autoComplete="email" className="text-end" {...register("email")} />
      </Field>
      {result && <FormMessage tone={result.ok ? "success" : "danger"}>{result.message}</FormMessage>}
      <Button type="submit" size="lg" disabled={pending}>
        إرسال رابط إعادة التعيين
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const { pending, result, run } = useAction();
  const { register, handleSubmit, formState } = useForm<z.input<typeof newPasswordSchema>>({ resolver: zodResolver(newPasswordSchema) });
  return (
    <form noValidate onSubmit={handleSubmit((v) => run(() => updatePassword(v)))} className="flex flex-col gap-4">
      <Field label="كلمة المرور الجديدة" htmlFor="new-password" error={formState.errors.password?.message}>
        <Input id="new-password" type="password" dir="ltr" autoComplete="new-password" className="text-end" {...register("password")} />
      </Field>
      <Field label="تأكيد كلمة المرور" htmlFor="new-confirm" error={formState.errors.confirm?.message}>
        <Input id="new-confirm" type="password" dir="ltr" autoComplete="new-password" className="text-end" {...register("confirm")} />
      </Field>
      {result && !result.ok && <FormMessage>{result.message}</FormMessage>}
      <Button type="submit" size="lg" disabled={pending}>
        حفظ كلمة المرور
      </Button>
    </form>
  );
}
