"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, LayoutDashboard, LogOut, MapPin, Package, UserRound } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { cn } from "@/lib/cn";

const links = [
  { href: "/account", label: "طلباتي", icon: Package },
  { href: "/account/addresses", label: "عناويني", icon: MapPin },
  { href: "/wishlist", label: "المفضلة", icon: Heart },
  { href: "/account/profile", label: "بياناتي", icon: UserRound },
];

export function AccountNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  return (
    <nav aria-label="حسابي" className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/account" ? pathname === "/account" || pathname.startsWith("/account/orders") : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-ink text-primary" : "hover:bg-surface-2",
            )}
          >
            <Icon size={18} aria-hidden />
            {label}
          </Link>
        );
      })}
      {isAdmin && (
        <Link href="/admin" className="flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-primary-strong hover:bg-surface-2">
          <LayoutDashboard size={18} aria-hidden />
          لوحة التحكم
        </Link>
      )}
      <form action={signOut} className="shrink-0">
        <button type="submit" className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-danger hover:bg-danger/10">
          <LogOut size={18} aria-hidden />
          تسجيل الخروج
        </button>
      </form>
    </nav>
  );
}
