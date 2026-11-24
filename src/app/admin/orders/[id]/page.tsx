import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { paymentMethods } from "@/lib/site";
import { formatDateTime, formatPrice } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";
import { vanexConfigured } from "@/lib/vanex";
import { AdminPageHeader, Panel, Table } from "@/components/admin/ui";
import { StatusBadge } from "@/components/cart/order-details";
import { OrderStatusForm, VanexButton } from "@/components/admin/order-actions";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { buttonClass } from "@/components/ui/button";

export const metadata = { title: "تفاصيل الطلب" };

export default async function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
  if (!order) notFound();
  const customerPhone = order.phone.replace(/^0/, "218");
  const profit = order.subtotal - order.product_discount - order.coupon_discount - order.cost_total;

  return (
    <div>
      <Link href="/admin/orders" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-strong">
        <ChevronRight size={16} aria-hidden /> كل الطلبات
      </Link>
      <AdminPageHeader
        title={`الطلب ${order.order_number}`}
        description={formatDateTime(order.created_at)}
        actions={<StatusBadge status={order.status} />}
      />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-6">
          <Panel title="المنتجات">
            <Table>
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>الكمية</th>
                  <th>السعر الأصلي</th>
                  <th>سعر البيع</th>
                  <th>التكلفة</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items.map((i) => (
                  <tr key={i.id}>
                    <td>{i.product_name}</td>
                    <td className="num">{i.quantity}</td>
                    <td className="num text-muted">{formatPrice(i.unit_price)}</td>
                    <td className="num">{formatPrice(i.unit_sale_price)}</td>
                    <td className="num text-muted">{formatPrice(i.unit_cost)}</td>
                    <td className="num font-semibold">{formatPrice(i.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <dl className="num grid gap-2 border-t border-border p-4 text-sm sm:grid-cols-2">
              <div className="flex justify-between"><dt className="text-muted">المجموع قبل الخصم</dt><dd>{formatPrice(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">خصم المنتجات</dt><dd>- {formatPrice(order.product_discount)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">كوبون {order.coupon_code ?? ""}</dt><dd>- {formatPrice(order.coupon_discount)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">التوصيل</dt><dd>{formatPrice(order.delivery_fee)}</dd></div>
              <div className="flex justify-between font-bold"><dt>الإجمالي المطلوب</dt><dd>{formatPrice(order.total)}</dd></div>
              <div className="flex justify-between font-bold text-success"><dt>ربح الطلب</dt><dd>{formatPrice(profit)}</dd></div>
            </dl>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="العميل والتوصيل">
            <dl className="flex flex-col gap-3 p-4 text-sm">
              <div><dt className="text-xs text-muted">الاسم</dt><dd className="font-semibold">{order.customer_name}</dd></div>
              <div><dt className="text-xs text-muted">الهاتف</dt><dd className="num font-semibold" dir="ltr" style={{ textAlign: "end" }}>{order.phone}</dd></div>
              <div><dt className="text-xs text-muted">العنوان</dt><dd className="font-semibold">{order.city_name}، {order.address}</dd></div>
              <div><dt className="text-xs text-muted">الدفع</dt><dd className="font-semibold">{paymentMethods[order.payment_method].label}</dd></div>
              {order.notes && <div><dt className="text-xs text-muted">ملاحظات</dt><dd>{order.notes}</dd></div>}
              <div><dt className="text-xs text-muted">حساب العميل</dt><dd>{order.user_id ? "مسجّل" : "زائر"}</dd></div>
            </dl>
            <div className="border-t border-border p-4">
              <a
                href={whatsappLink(`مرحباً ${order.customer_name}، بخصوص طلبك ${order.order_number} من فولتورا سنتر`).replace(/wa\.me\/\d+/, `wa.me/${customerPhone}`)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("whatsapp", "md", "w-full")}
              >
                <WhatsAppIcon size={18} /> مراسلة العميل على واتساب
              </a>
            </div>
          </Panel>
          <Panel title="تحديث الطلب">
            <div className="flex flex-col gap-5 p-4">
              <OrderStatusForm id={order.id} status={order.status} tracking={order.vanex_tracking} />
              <VanexButton id={order.id} configured={vanexConfigured()} />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
