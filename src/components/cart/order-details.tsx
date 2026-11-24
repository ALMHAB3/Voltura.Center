import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import type { OrderSummary } from "@/lib/orders";
import { statusFlow } from "@/lib/orders";
import { orderStatuses, paymentMethods } from "@/lib/site";
import { formatDateTime, formatPrice } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import { cn } from "@/lib/cn";

export function StatusBadge({ status }: { status: OrderSummary["status"] }) {
  const s = orderStatuses[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        s.tone === "success" && "bg-success/15 text-success",
        s.tone === "warning" && "bg-warning/15 text-warning",
        s.tone === "info" && "bg-info/15 text-info",
        s.tone === "danger" && "bg-danger/15 text-danger",
      )}
    >
      {s.label}
    </span>
  );
}

export function StatusSteps({ status }: { status: OrderSummary["status"] }) {
  if (status === "cancelled") return <StatusBadge status={status} />;
  const current = statusFlow.indexOf(status);
  return (
    <ol className="grid grid-cols-5 gap-1 text-center text-[11px] sm:text-xs">
      {statusFlow.map((s, i) => (
        <li key={s} className="flex flex-col items-center gap-1.5">
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-full border-2",
              i <= current ? "border-primary-strong bg-ink text-primary" : "border-border text-muted",
            )}
          >
            {i < current ? <Check size={16} aria-hidden /> : <span className="num">{i + 1}</span>}
          </span>
          <span className={i <= current ? "font-semibold" : "text-muted"}>{orderStatuses[s].label}</span>
        </li>
      ))}
    </ol>
  );
}

export function OrderDetails({ order }: { order: OrderSummary }) {
  return (
    <div className="flex flex-col gap-5">
      <ul className="flex flex-col divide-y divide-border">
        {order.items.map((item, i) => (
          <li key={i} className="flex items-center gap-3 py-3">
            <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-surface-2">
              {item.image && <Image src={imageUrl(item.image)!} alt="" fill sizes="56px" className="object-cover" />}
            </span>
            <span className="min-w-0 flex-1">
              {item.slug ? (
                <Link href={`/product/${item.slug}`} className="line-clamp-1 text-sm font-semibold hover:text-primary-strong">
                  {item.name}
                </Link>
              ) : (
                <span className="line-clamp-1 text-sm font-semibold">{item.name}</span>
              )}
              <span className="num block text-xs text-muted">
                {item.quantity} × {formatPrice(item.unit_sale_price)}
              </span>
            </span>
            <span className="num text-sm font-bold">{formatPrice(item.line_total)}</span>
          </li>
        ))}
      </ul>
      <dl className="num flex flex-col gap-2 rounded-xl bg-surface-2 p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">المجموع</dt>
          <dd>{formatPrice(order.subtotal)}</dd>
        </div>
        {order.product_discount > 0 && (
          <div className="flex justify-between text-success">
            <dt>خصم المنتجات</dt>
            <dd>- {formatPrice(order.product_discount)}</dd>
          </div>
        )}
        {order.coupon_discount > 0 && (
          <div className="flex justify-between text-success">
            <dt>كود الخصم</dt>
            <dd>- {formatPrice(order.coupon_discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted">التوصيل إلى {order.city_name}</dt>
          <dd>{formatPrice(order.delivery_fee)}</dd>
        </div>
        <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
          <dt>الإجمالي</dt>
          <dd>{formatPrice(order.total)}</dd>
        </div>
      </dl>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted">المستلم</dt>
          <dd className="font-semibold">{order.customer_name}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">العنوان</dt>
          <dd className="font-semibold">
            {order.city_name}، {order.address}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">طريقة الدفع</dt>
          <dd className="font-semibold">{paymentMethods[order.payment_method].label}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">تاريخ الطلب</dt>
          <dd className="font-semibold">{formatDateTime(order.created_at)}</dd>
        </div>
      </dl>
    </div>
  );
}
