"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { imageUrl } from "@/lib/images";
import { cn } from "@/lib/cn";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Uploads images straight from the admin's device to Supabase Storage (bucket "media").
 * Storage policies only accept uploads from admins.
 */
export function ImageUploader({
  value,
  onChange,
  folder,
  multiple = true,
}: {
  value: string[];
  onChange: (paths: string[]) => void;
  folder: "products" | "banners" | "brands";
  multiple?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const supabase = createClient();
    const list = Array.from(files).slice(0, multiple ? 12 : 1);
    setUploading(list.length);
    const uploaded: string[] = [];
    for (const file of list) {
      if (!TYPES.includes(file.type)) {
        setError("الصيغ المسموحة: JPG، PNG، WEBP، AVIF");
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError("حجم الصورة أكبر من 5 ميغابايت");
        continue;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, file, { cacheControl: "31536000", contentType: file.type });
      if (upErr) setError(`تعذّر رفع ${file.name}`);
      else uploaded.push(path);
      setUploading((n) => n - 1);
    }
    setUploading(0);
    onChange(multiple ? [...value, ...uploaded] : uploaded.slice(0, 1));
    if (input.current) input.current.value = "";
  }

  const move = (i: number, dir: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {value.map((path, i) => (
          <li key={path} className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-2">
            <Image src={imageUrl(path)!} alt="" fill sizes="160px" className="object-cover" />
            {i === 0 && multiple && <span className="absolute start-1.5 top-1.5 rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-bold text-primary">الرئيسية</span>}
            <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1">
              {multiple && (
                <span className="flex gap-1">
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="تقديم" className="flex size-7 items-center justify-center rounded-md bg-surface/90 disabled:opacity-30">
                    <ArrowUp size={14} aria-hidden />
                  </button>
                  <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label="تأخير" className="flex size-7 items-center justify-center rounded-md bg-surface/90 disabled:opacity-30">
                    <ArrowDown size={14} aria-hidden />
                  </button>
                </span>
              )}
              <button type="button" onClick={() => onChange(value.filter((p) => p !== path))} aria-label="إزالة الصورة" className="flex size-7 items-center justify-center rounded-md bg-danger text-white">
                <X size={14} aria-hidden />
              </button>
            </div>
          </li>
        ))}
        {(multiple || value.length === 0) && (
          <li>
            <button
              type="button"
              onClick={() => input.current?.click()}
              disabled={uploading > 0}
              className={cn(
                "flex aspect-square w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border text-xs font-semibold text-muted transition hover:border-primary-strong hover:text-primary-strong",
              )}
            >
              {uploading > 0 ? <Loader2 size={22} className="animate-spin" aria-hidden /> : <ImagePlus size={22} aria-hidden />}
              {uploading > 0 ? "جارِ الرفع…" : "رفع صور من جهازك"}
            </button>
          </li>
        )}
      </ul>
      <input ref={input} type="file" accept={TYPES.join(",")} multiple={multiple} hidden onChange={(e) => upload(e.target.files)} />
      {error && <p className="text-xs text-danger">{error}</p>}
      <p className="text-xs text-muted">JPG أو PNG أو WEBP، حتى 5 ميغابايت للصورة. الصورة الأولى تظهر في بطاقة المنتج.</p>
    </div>
  );
}
