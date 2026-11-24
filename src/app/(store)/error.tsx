"use client";

import { AlertTriangle } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";

export default function StoreError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-danger/10 text-danger">
        <AlertTriangle size={28} aria-hidden />
      </span>
      <h1 className="text-xl font-bold">تعذّر تحميل الصفحة</h1>
      <p className="text-sm text-muted">حدث خطأ أثناء جلب البيانات. تحقق من اتصالك ثم أعد المحاولة.</p>
      <div className="flex gap-2">
        <Button onClick={reset}>إعادة المحاولة</Button>
        <LinkButton href="/" variant="outline">
          الرئيسية
        </LinkButton>
      </div>
    </div>
  );
}
