"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

export function Countdown({ endsAt, compact = false, className }: { endsAt: string; compact?: boolean; className?: string }) {
  // null until mounted, so server and client render the same first frame.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);

  const p = now === null ? null : parts(new Date(endsAt).getTime() - now);
  const pad = (n: number | undefined) => (n === undefined ? "--" : String(n).padStart(2, "0"));

  if (compact) {
    return (
      <span className={cn("num", className)}>
        {p && p.days > 0 && `${p.days} يوم `}
        {pad(p?.hours)}:{pad(p?.minutes)}:{pad(p?.seconds)}
      </span>
    );
  }

  const units = [
    { label: "يوم", value: p?.days },
    { label: "ساعة", value: p?.hours },
    { label: "دقيقة", value: p?.minutes },
    { label: "ثانية", value: p?.seconds },
  ];
  return (
    <div className={cn("flex gap-1.5", className)} role="timer" aria-label="الوقت المتبقي للعرض">
      {units.map((u) => (
        <div key={u.label} className="flex min-w-12 flex-col items-center rounded-xl bg-ink px-2 py-1.5 text-ink-foreground">
          <span className="num text-lg font-bold leading-none">{pad(u.value)}</span>
          <span className="mt-1 text-[10px] text-ink-muted">{u.label}</span>
        </div>
      ))}
    </div>
  );
}
