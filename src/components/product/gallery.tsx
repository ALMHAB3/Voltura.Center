"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { imageUrl } from "@/lib/images";
import { cn } from "@/lib/cn";

type Img = { id: number; path: string; alt: string | null };

export function Gallery({ images, name }: { images: Img[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const current = images[index];
  const go = (i: number) => setIndex((i + images.length) % images.length);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") go(index + 1);
      if (e.key === "ArrowRight") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  });

  if (!current) {
    return <div className="aspect-square rounded-3xl border border-border bg-surface-2" aria-hidden />;
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse">
      <div className="relative min-w-0 flex-1">
        <button
          type="button"
          onClick={() => setLightbox(true)}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
          }}
          onMouseLeave={() => setZoom(null)}
          aria-label="تكبير الصورة"
          className="relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-3xl border border-border bg-surface-2"
        >
          <Image
            src={imageUrl(current.path)!}
            alt={current.alt ?? name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-200"
            style={zoom ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
          />
          <span className="absolute bottom-3 end-3 flex items-center gap-1 rounded-full bg-ink/80 px-2.5 py-1 text-xs text-ink-foreground">
            <ZoomIn size={14} aria-hidden />
            <span className="num">
              {index + 1} / {images.length}
            </span>
          </span>
        </button>
      </div>

      {images.length > 1 && (
        <ul className="scrollbar-none flex gap-2 overflow-x-auto lg:w-20 lg:flex-col">
          {images.map((img, i) => (
            <li key={img.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`الصورة ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "relative block size-16 overflow-hidden rounded-xl border-2 bg-surface-2 lg:size-20",
                  i === index ? "border-primary-strong" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Image src={imageUrl(img.path)!} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-3/95 p-4" role="dialog" aria-modal="true" aria-label={name}>
          <button type="button" onClick={() => setLightbox(false)} aria-label="إغلاق" className="absolute end-4 top-4 flex size-11 items-center justify-center rounded-full bg-white/10 text-white">
            <X size={22} aria-hidden />
          </button>
          {images.length > 1 && (
            <>
              <button type="button" onClick={() => go(index - 1)} aria-label="السابقة" className="absolute start-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white">
                <ChevronRight size={22} aria-hidden />
              </button>
              <button type="button" onClick={() => go(index + 1)} aria-label="التالية" className="absolute end-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white">
                <ChevronLeft size={22} aria-hidden />
              </button>
            </>
          )}
          <div className="relative aspect-square w-full max-w-3xl">
            <Image src={imageUrl(current.path)!} alt={current.alt ?? name} fill sizes="100vw" quality={90} className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
