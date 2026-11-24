import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { OrderSummary } from "@/lib/orders";
import { paymentMethods } from "@/lib/site";
import { orderConfirmationMessage, whatsappLink } from "@/lib/whatsapp";
import { OrderDetails, StatusSteps } from "@/components/cart/order-details";
import { WhatsAppRedirect } from "@/components/cart/whatsapp-redirect";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = { title: "تم استلام طلبك", robots: { index: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function OrderPage({ params, searchParams }: PageProps<"/order/[id]">) {
  const { id } = await params;
  const { new: isNew } = await searchParams;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const { data } = await supabase.rpc("get_order_by_id", { p_order_id: id });
  if (!data) notFound();
  const order = data as unknown as OrderSummary;
  const message = orderConfirmationMessage({
    ...order,
    items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, line_total: i.line_total })),
  });

  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 lg:px-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
          <CircleCheck size={36} aria-hidden />
        </span>
        <h1 className="text-2xl font-bold sm:text-3xl">شكراً {order.customer_name.split(" ")[0]}، تم استلام طلبك</h1>
        <p className="text-muted">
          رقم الطلب:{" "}
          <strong className="num rounded-lg bg-ink px-2.5 py-1 text-lg text-primary" dir="ltr">
            {order.order_number}
          </strong>
        </p>
        <p className="max-w-md text-sm leading-6 text-muted">
          الخطوة الأخيرة: أرسل تفاصيل الطلب لنا على واتساب حتى نتأكد منه ونجهّزه للتوصيل. احتفظ برقم الطلب لتتبعه.
        </p>
        <WhatsAppRedirect href={whatsappLink(message)} auto={isNew === "1"} />
      </div>

      {order.payment_method !== "cash" && (
        <div className="mt-6 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm leading-6">
          <strong>{paymentMethods[order.payment_method].label}: </strong>
          {paymentMethods[order.payment_method].instructions}
        </div>
      )}

      <section className="mt-6 flex flex-col gap-5 rounded-3xl border border-border bg-surface p-5 sm:p-6">
        <StatusSteps status={order.status} />
        <OrderDetails order={order} />
      </section>

      <div className="mt-6 flex justify-center gap-2">
        <LinkButton href="/products" variant="outline">
          متابعة التسوق
        </LinkButton>
        <LinkButton href="/track" variant="ghost">
          تتبع الطلب
        </LinkButton>
      </div>
    </div>
  );
}
