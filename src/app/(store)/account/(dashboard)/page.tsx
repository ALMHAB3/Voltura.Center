import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPrice } from "@/lib/format";
import { StatusBadge } from "@/components/cart/order-details";
import { FormMessage } from "@/components/ui/form";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = { title: "طلباتي", robots: { index: false } };

export default async function AccountOrdersPage({ searchParams }: PageProps<"/account">) {
  const { password } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, total, created_at, order_items(quantity)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <section>
      <h1 className="mb-4 text-xl font-bold">طلباتي</h1>
      {password === "updated" && (
        <div className="mb-4">
          <FormMessage tone="success">تم تغيير كلمة المرور.</FormMessage>
        </div>
      )}
      {orders?.length ? (
        <ul className="flex flex-col gap-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/account/orders/${o.order_number}`}
                className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition hover:border-primary-strong/50"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-surface-2 text-primary-strong">
                  <Package size={20} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="num block font-bold" dir="ltr" style={{ textAlign: "start" }}>
                    {o.order_number}
                  </span>
                  <span className="num block text-xs text-muted">
                    {formatDate(o.created_at)} · {o.order_items.reduce((s, i) => s + i.quantity, 0)} قطعة
                  </span>
                </span>
                <span className="flex flex-col items-end gap-1">
                  <span className="num font-bold">{formatPrice(o.total)}</span>
                  <StatusBadge status={o.status} />
                </span>
                <ChevronLeft size={18} className="text-muted" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface py-14 text-center">
          <Package size={36} className="text-muted" aria-hidden />
          <p className="font-semibold">لا توجد طلبات بعد</p>
          <LinkButton href="/products" size="sm">
            ابدأ التسوق
          </LinkButton>
        </div>
      )}
    </section>
  );
}
