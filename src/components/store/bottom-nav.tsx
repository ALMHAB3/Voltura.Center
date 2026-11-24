"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/cn";
import { CartCount } from "./cart-count";

const items = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/products", label: "المتجر", icon: LayoutGrid },
  { href: "/cart", label: "السلة", icon: ShoppingCart, cart: true },
  { href: "/wishlist", label: "المفضلة", icon: Heart },
  { href: "/account", label: "حسابي", icon: User },
];

/** Fixed bottom navigation on phones. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="التنقل السريع"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
    >
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon, cart }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
                  active ? "text-primary-strong" : "text-muted",
                )}
              >
                <span className="relative">
                  <Icon size={22} aria-hidden />
                  {cart && <CartCount />}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
