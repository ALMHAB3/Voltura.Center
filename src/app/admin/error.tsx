"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-danger/30 bg-danger/10 p-6">
      <h1 className="text-lg font-bold text-danger">حدث خطأ في لوحة التحكم</h1>
      <p className="text-sm">{error.message}</p>
      <Button onClick={reset}>إعادة المحاولة</Button>
    </div>
  );
}
