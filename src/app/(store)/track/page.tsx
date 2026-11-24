import type { Metadata } from "next";
import { Suspense } from "react";
import { PackageSearch } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { OrderSummary } from "@/lib/orders";
import { OrderDetails, StatusSteps } from "@/components/cart/order-details";
import { TrackForm } from "@/components/cart/track-form";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata: Metadata = {
  title: "تتبع طلبك",
  description: "اعرف حالة طلبك برقم الطلب ورقم الهاتف، بدون تسجيل دخول.",
};

export default async function TrackPage({ searchParams }: PageProps<"/track">) {
  const { order: orderNumber, phone } = await searchParams;
  let order: OrderSummary | null = null;
  const searched = typeof orderNumber === "string" && typeof phone === "string";
  if (searched) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("track_order", { p_order_number: orderNumber, p_phone: phone });
    order = (data as unknown as OrderSummary) ?? null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pt-5 lg:px-6">
      <Breadcrumbs items={[{ label: "تتبع طلبك" }]} />
      <h1 className="text-2xl font-bold sm:text-3xl">تتبع طلبك</h1>
      <p className="mb-5 mt-1.5 text-sm text-muted">أدخل رقم الطلب ورقم الهاتف الذي استخدمته عند الطلب. لا تحتاج لتسجيل الدخول.</p>
      <div className="rounded-2xl border border-border bg-surface p-5">
        <Suspense>
          <TrackForm />
        </Suspense>
      </div>
      {searched &&
        (order ? (
          <section className="mt-6 flex flex-col gap-5 rounded-3xl border border-border bg-surface p-5 sm:p-6">
            <h2 className="num text-lg font-bold" dir="ltr">
              {order.order_number}
            </h2>
            <StatusSteps status={order.status} />
            <OrderDetails order={order} />
          </section>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-surface px-4 py-10 text-center">
            <PackageSearch size={32} className="text-muted" aria-hidden />
            <p className="font-semibold">لم نجد طلباً بهذه البيانات</p>
            <p className="text-sm text-muted">تأكد من رقم الطلب (مثل VC-1001) ومن رقم الهاتف.</p>
          </div>
        ))}
    </div>
  );
}
