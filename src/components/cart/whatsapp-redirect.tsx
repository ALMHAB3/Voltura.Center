"use client";

import { useEffect, useState } from "react";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { buttonClass } from "@/components/ui/button";

/** Sends a new customer to WhatsApp with the order details, after a short visible countdown. */
export function WhatsAppRedirect({ href, auto }: { href: string; auto: boolean }) {
  const [seconds, setSeconds] = useState(auto ? 4 : 0);

  useEffect(() => {
    if (!auto) return;
    // Remove ?new=1 so a refresh does not redirect again.
    window.history.replaceState(null, "", window.location.pathname);
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [auto]);

  useEffect(() => {
    if (auto && seconds === 0) window.location.href = href;
  }, [auto, seconds, href]);

  return (
    <div className="flex flex-col items-center gap-2">
      <a href={href} target="_blank" rel="noopener noreferrer" className={buttonClass("whatsapp", "lg", "w-full sm:w-auto")}>
        <WhatsAppIcon size={22} />
        أرسل الطلب على واتساب للتأكيد
      </a>
      {auto && seconds > 0 && (
        <p className="num text-sm text-muted" aria-live="polite">
          سيتم فتح واتساب تلقائياً خلال {seconds} ثوانٍ…
        </p>
      )}
    </div>
  );
}
