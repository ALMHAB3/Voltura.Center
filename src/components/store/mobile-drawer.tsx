"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Flame, LayoutDashboard, Menu, PackageSearch, User, X } from "lucide-react";
import type { Category } from "@/lib/queries";
import { CategoryIcon } from "./category-icon";
import { Logo } from "./logo";

type Tree = (Category & { children: Category[] })[];

export function MobileDrawer({ tree, isSignedIn, isAdmin }: { tree: Tree; isSignedIn: boolean; isAdmin: boolean }) {
  const pathname = usePathname();
  // The drawer belongs to the page it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="القائمة"
        aria-expanded={open}
        className="flex size-10 items-center justify-center rounded-xl hover:bg-white/10 lg:hidden"
      >
        <Menu size={22} aria-hidden />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="القائمة">
          <button type="button" aria-label="إغلاق" className="absolute inset-0 bg-ink-3/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 start-0 flex w-[min(340px,86vw)] animate-slide-in-start flex-col bg-surface text-foreground shadow-pop">
            <div className="flex items-center justify-between bg-ink-gradient px-4 py-3 text-ink-foreground">
              <Logo />
              <button type="button" onClick={() => setOpen(false)} aria-label="إغلاق القائمة" className="flex size-10 items-center justify-center rounded-xl hover:bg-white/10">
                <X size={22} aria-hidden />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3" aria-label="الأقسام">
              <p className="px-2 pb-2 pt-1 text-xs font-semibold tracking-wide text-muted">الأقسام</p>
              <ul className="flex flex-col gap-0.5">
                {tree.map((cat) => (
                  <li key={cat.id}>
                    <div className="flex items-center">
                      <Link href={`/category/${cat.slug}`} className="flex flex-1 items-center gap-3 rounded-xl px-2 py-2.5 font-medium hover:bg-surface-2">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-surface-2 text-primary-strong">
                          <CategoryIcon name={cat.icon} size={18} />
                        </span>
                        {cat.name}
                      </Link>
                      {cat.children.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
                          aria-label={`أقسام ${cat.name}`}
                          aria-expanded={expanded === cat.id}
                          className="flex size-10 items-center justify-center rounded-xl hover:bg-surface-2"
                        >
                          <ChevronDown size={18} className={expanded === cat.id ? "rotate-180 transition" : "transition"} aria-hidden />
                        </button>
                      )}
                    </div>
                    {expanded === cat.id && (
                      <ul className="mb-1 ms-14 flex flex-col border-s border-border ps-3">
                        {cat.children.map((child) => (
                          <li key={child.id}>
                            <Link href={`/category/${child.slug}`} className="block rounded-lg px-2 py-2 text-sm text-muted hover:bg-surface-2 hover:text-foreground">
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
              <div className="my-3 border-t border-border" />
              <ul className="flex flex-col gap-0.5 text-sm">
                <li>
                  <Link href="/offers" className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold text-primary-strong hover:bg-surface-2">
                    <Flame size={18} aria-hidden /> العروض
                  </Link>
                </li>
                <li>
                  <Link href="/track" className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-surface-2">
                    <PackageSearch size={18} aria-hidden /> تتبع طلبك
                  </Link>
                </li>
                <li>
                  <Link href={isSignedIn ? "/account" : "/account/login"} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-surface-2">
                    <User size={18} aria-hidden /> {isSignedIn ? "حسابي" : "تسجيل الدخول"}
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link href="/admin" className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-surface-2">
                      <LayoutDashboard size={18} aria-hidden /> لوحة التحكم
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
