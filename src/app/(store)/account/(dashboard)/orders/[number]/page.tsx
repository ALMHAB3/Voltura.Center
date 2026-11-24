import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { OrderSummary } from "@/lib/orders";
import { OrderDetails, StatusSteps } from "@/components/cart/order-details";

export const metadata: Metadata = { title: "تفاصيل الطلب", robots: { index: false } };

export default async function AccountOrderPage({ params }: PageProps<"/account/orders/[number]">) {
  const { number } = await params;
  const supabase = await createClient();
  // RLS returns the order only if it belongs to the signed-in customer.
  const { data: own } = await supabase.from("orders").select("order_number, phone").eq("order_number", number).maybeSingle();
  if (!own) notFound();
  const { data } = await supabase.rpc("track_order", { p_order_number: own.order_number, p_phone: own.phone });
  if (!data) notFound();
  const order = data as unknown as OrderSummary;

  return (
    <section className="flex flex-col gap-5">
      <Link href="/account" className="flex items-center gap-1 text-sm font-semibold text-primary-strong">
        <ChevronRight size={16} aria-hidden /> كل الطلبات
      </Link>
      <h1 className="num text-xl font-bold" dir="ltr" style={{ textAlign: "end" }}>
        {order.order_number}
      </h1>
      <div className="flex flex-col gap-5 rounded-3xl border border-border bg-surface p-5 sm:p-6">
        <StatusSteps status={order.status} />
        <OrderDetails order={order} />
      </div>
    </section>
  );
}
