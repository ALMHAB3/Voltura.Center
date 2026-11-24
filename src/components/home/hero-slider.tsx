"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { imageUrl } from "@/lib/images";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Banner = {
  id: number;
  title: string;
  subtitle: string | null;
  image_path: string;
  link_url: string | null;
  button_label: string | null;
};

export function HeroSlider({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = banners.length;
  const go = useCallback((i: number) => setIndex((i + count) % count), [count]);

  useEffect(() => {
    if (paused || count < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(t);
  }, [paused, count]);

  if (!count) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="العروض الرئيسية"
      className="relative overflow-hidden rounded-3xl bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        const x = e.touches[0].clientX;
        const onEnd = (ev: TouchEvent) => {
          const dx = ev.changedTouches[0].clientX - x;
          // RTL: swiping left goes to the next slide.
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
          window.removeEventListener("touchend", onEnd);
        };
        window.addEventListener("touchend", onEnd);
      }}
    >
      <div className="relative aspect-[16/10] sm:aspect-[5/2]">
        {banners.map((b, i) => (
          <div
            key={b.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} من ${count}`}
            aria-hidden={i !== index}
            className={cn("absolute inset-0 transition-opacity duration-700", i === index ? "opacity-100" : "pointer-events-none opacity-0")}
          >
            <Image
              src={imageUrl(b.image_path)!}
              alt=""
              fill
              priority={i === 0}
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-left"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-3/95 via-ink-3/60 to-ink-3/10 sm:bg-gradient-to-l sm:from-ink-3/80 sm:via-ink-3/30 sm:to-transparent" />
            <div className="absolute inset-0 flex w-full max-w-xl flex-col justify-end gap-2 p-5 pb-10 sm:inset-y-0 sm:start-0 sm:justify-center sm:gap-4 sm:p-12">
              <h2 className="text-xl font-bold leading-tight text-ink-foreground sm:text-4xl lg:text-5xl">{b.title}</h2>
              {b.subtitle && <p className="line-clamp-2 max-w-md text-xs leading-5 text-ink-muted sm:text-base sm:leading-6">{b.subtitle}</p>}
              {b.link_url && (
                <Link href={b.link_url} tabIndex={i === index ? 0 : -1} className={buttonClass("primary", "sm", "mt-1 self-start sm:h-11 sm:px-5")}>
                  {b.button_label ?? "تسوّق الآن"}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="السابق"
            onClick={() => go(index - 1)}
            className="absolute start-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25 sm:flex"
          >
            <ChevronRight size={20} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="التالي"
            onClick={() => go(index + 1)}
            className="absolute end-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25 sm:flex"
          >
            <ChevronLeft size={20} aria-hidden />
          </button>
          <div className="absolute bottom-4 start-5 flex gap-2 sm:start-12">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                aria-label={`الشريحة ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
                className={cn("h-1.5 rounded-full transition-all", i === index ? "w-8 bg-primary" : "w-3 bg-white/40")}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
