"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FolderTree, Image as ImageIcon, LayoutDashboard, MapPinned, Package, Receipt, Store, Tag, Ticket } from "lucide-react";
import { cn } from "@/lib/cn";

const links = [
  { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/admin/orders", label: "الطلبات", icon: Receipt },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/reports", label: "التقارير", icon: BarChart3 },
  { href: "/admin/categories", label: "الأقسام", icon: FolderTree },
  { href: "/admin/brands", label: "الماركات", icon: Tag },
  { href: "/admin/banners", label: "البانرات", icon: ImageIcon },
  { href: "/admin/coupons", label: "الكوبونات", icon: Ticket },
  { href: "/admin/cities", label: "المدن والتوصيل", icon: MapPinned },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="لوحة التحكم" className="scrollbar-none flex gap-1 overflow-x-auto lg:flex-col">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-ink-muted hover:bg-white/10 hover:text-ink-foreground",
            )}
          >
            <Icon size={18} aria-hidden />
            {label}
          </Link>
        );
      })}
      <Link href="/" className="mt-2 flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink-muted hover:bg-white/10 hover:text-ink-foreground lg:mt-6">
        <Store size={18} aria-hidden />
        عرض المتجر
      </Link>
    </nav>
  );
}
