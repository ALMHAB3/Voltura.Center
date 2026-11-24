"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import { cn } from "@/lib/cn";

type Result = { id: number; name: string; slug: string; price: number; salePrice: number; image: string | null };

export function SearchBox({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced suggestions.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const json = (await res.json()) as { results: Result[] };
        setResults(json.results);
        setActive(-1);
        setOpen(true);
      } catch {
        // Aborted or offline: keep the previous suggestions.
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Suggestions only apply to the current query.
  const visible = query.trim().length >= 2 ? results : [];

  function submit() {
    const q = query.trim();
    if (active >= 0 && visible[active]) {
      router.push(`/product/${visible[active].slug}`);
    } else if (q) {
      router.push(`/products?q=${encodeURIComponent(q)}`);
    }
    setOpen(false);
  }

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label htmlFor={`${listId}-input`} className="sr-only">
          ابحث عن منتج
        </label>
        <input
          id={`${listId}-input`}
          type="search"
          value={query}
          autoFocus={autoFocus}
          autoComplete="off"
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => visible.length && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => Math.min(visible.length - 1, i + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(-1, i - 1));
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder="ابحث عن لابتوب، هاتف، سماعة…"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          className="h-11 w-full rounded-xl border border-white/10 bg-white/10 pe-11 ps-4 text-sm text-ink-foreground placeholder:text-ink-muted outline-none transition focus:border-primary focus:bg-white/15"
        />
        <button
          type="submit"
          aria-label="بحث"
          className="absolute inset-y-1 end-1 flex w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
        </button>
      </form>

      {open && query.trim().length >= 2 && (
        <div
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-surface text-foreground shadow-pop animate-fade-in"
        >
          {visible.length === 0 && !loading ? (
            <p className="px-4 py-5 text-center text-sm text-muted">لا توجد نتائج لـ «{query.trim()}»</p>
          ) : (
            <ul>
              {visible.map((r, i) => (
                <li key={r.id} role="option" aria-selected={i === active}>
                  <Link
                    href={`/product/${r.slug}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-surface-2",
                      i === active && "bg-surface-2",
                    )}
                  >
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                      {r.image && (
                        <Image src={imageUrl(r.image)!} alt="" fill sizes="48px" className="object-cover" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{r.name}</span>
                      <span className="num text-sm font-bold text-primary-strong">{formatPrice(r.salePrice)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {visible.length > 0 && (
            <button
              type="button"
              onClick={submit}
              className="block w-full border-t border-border px-4 py-3 text-center text-sm font-semibold text-primary-strong hover:bg-surface-2"
            >
              عرض كل النتائج
            </button>
          )}
        </div>
      )}
    </div>
  );
}
