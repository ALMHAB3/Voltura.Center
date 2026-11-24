"use client";

import { useEffect, useState } from "react";
import { CircleCheck, AlertTriangle } from "lucide-react";

type Toast = { id: number; message: string; tone: "success" | "danger" };

let counter = 0;

/** Show a short message at the bottom of the screen. */
export function toast(message: string, tone: Toast["tone"] = "success") {
  window.dispatchEvent(new CustomEvent("vc-toast", { detail: { id: ++counter, message, tone } }));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => {
    const onToast = (e: Event) => {
      const t = (e as CustomEvent<Toast>).detail;
      setToasts((list) => [...list.slice(-2), t]);
      setTimeout(() => setToasts((list) => list.filter((x) => x.id !== t.id)), 3200);
    };
    window.addEventListener("vc-toast", onToast);
    return () => window.removeEventListener("vc-toast", onToast);
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex animate-fade-in items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-ink-foreground shadow-pop"
        >
          {t.tone === "success" ? (
            <CircleCheck size={18} className="text-primary" aria-hidden />
          ) : (
            <AlertTriangle size={18} className="text-sale" aria-hidden />
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}
