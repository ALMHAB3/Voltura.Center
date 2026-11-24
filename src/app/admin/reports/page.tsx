import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatNumber, formatPrice } from "@/lib/format";
import { paymentMethods, type PaymentMethod } from "@/lib/site";
import { AdminPageHeader, Panel, StatCard, Table } from "@/components/admin/ui";
import { cn } from "@/lib/cn";

export const metadata = { title: "التقارير" };

type Report = {
  orders_count: number;
  cancelled_count: number;
  items_sold: number;
  gross_sales: number;
  product_discounts: number;
  coupon_discounts: number;
  net_sales: number;
  delivery_fees: number;
  cost: number;
  profit: number;
  collected: number;
  by_day: { day: string; orders: number; net_sales: number; profit: number }[];
  by_payment: Partial<Record<PaymentMethod, number>>;
  top_products: { name: string; quantity: number; revenue: number; profit: number; discount: number }[];
};

const fmt = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Tripoli" }).format(d);
const isDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

function presets() {
  const now = new Date();
  const today = fmt(now);
  const monthStart = today.slice(0, 8) + "01";
  const lastMonthEnd = new Date(new Date(monthStart).getTime() - 86400000);
  return [
    { label: "اليوم", from: today, to: today },
    { label: "آخر 7 أيام", from: fmt(new Date(now.getTime() - 6 * 86400000)), to: today },
    { label: "هذا الشهر", from: monthStart, to: today },
    { label: "الشهر الماضي", from: fmt(lastMonthEnd).slice(0, 8) + "01", to: fmt(lastMonthEnd) },
    { label: "آخر 12 شهراً", from: fmt(new Date(now.getTime() - 364 * 86400000)), to: today },
  ];
}

export default async function ReportsPage({ searchParams }: PageProps<"/admin/reports">) {
  const sp = await searchParams;
  const ranges = presets();
  const from = isDate(sp.from) ? sp.from : ranges[2].from;
  const to = isDate(sp.to) ? sp.to : ranges[2].to;

  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_report", { p_from: from, p_to: to });
  const r = data as unknown as Report;
  const maxDay = Math.max(1, ...r.by_day.map((d) => d.net_sales));
  const margin = r.net_sales ? Math.round((r.profit / r.net_sales) * 100) : 0;

  return (
    <div>
      <AdminPageHeader title="تقرير المبيعات والأرباح" description="الطلبات الملغاة مستبعدة. الربح = صافي المبيعات − تكلفة المنتجات (بدون رسوم التوصيل)." />

      <div className="mb-6 flex flex-wrap items-end gap-2">
        {ranges.map((p) => (
          <Link
            key={p.label}
            href={`/admin/reports?from=${p.from}&to=${p.to}`}
            className={cn("rounded-xl px-3 py-2 text-sm font-medium", p.from === from && p.to === to ? "bg-ink text-primary" : "bg-surface hover:bg-surface-2")}
          >
            {p.label}
          </Link>
        ))}
        <form action="/admin/reports" className="ms-auto flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-muted">
            من
            <input type="date" name="from" defaultValue={from} className="h-9 rounded-xl border border-border bg-surface px-2 text-sm text-foreground" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            إلى
            <input type="date" name="to" defaultValue={to} className="h-9 rounded-xl border border-border bg-surface px-2 text-sm text-foreground" />
          </label>
          <button type="submit" className="h-9 rounded-xl bg-ink px-4 text-sm font-semibold text-primary">عرض</button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="صافي المبيعات" value={formatPrice(r.net_sales)} hint={`${formatNumber(r.orders_count)} طلب · ${formatNumber(r.items_sold)} قطعة`} />
        <StatCard label="صافي الربح" value={formatPrice(r.profit)} tone={r.profit >= 0 ? "success" : "danger"} hint={`هامش ${margin}%`} />
        <StatCard label="تكلفة المنتجات المباعة" value={formatPrice(r.cost)} />
        <StatCard label="متوسط قيمة الطلب" value={formatPrice(r.orders_count ? Math.round(r.net_sales / r.orders_count) : 0)} />
        <StatCard label="المبيعات قبل الخصومات" value={formatPrice(r.gross_sales)} />
        <StatCard label="خصومات المنتجات" value={formatPrice(r.product_discounts)} tone="warning" hint="الفرق بين السعر الأصلي وسعر البيع المقرّب" />
        <StatCard label="خصومات الكوبونات" value={formatPrice(r.coupon_discounts)} tone="warning" />
        <StatCard label="رسوم التوصيل المحصّلة" value={formatPrice(r.delivery_fees)} hint={`${formatNumber(r.cancelled_count)} طلب ملغي في الفترة`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="المبيعات حسب اليوم">
          <Table>
            <thead>
              <tr>
                <th>اليوم</th>
                <th>الطلبات</th>
                <th className="w-2/5">صافي المبيعات</th>
                <th>الربح</th>
              </tr>
            </thead>
            <tbody>
              {r.by_day.map((d) => (
                <tr key={d.day}>
                  <td className="num">{d.day}</td>
                  <td className="num">{d.orders}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 rounded-full bg-primary-strong" style={{ width: `${(d.net_sales / maxDay) * 100}%`, minWidth: 4 }} aria-hidden />
                      <span className="num shrink-0 text-xs font-semibold">{formatPrice(d.net_sales)}</span>
                    </div>
                  </td>
                  <td className={cn("num font-semibold", d.profit >= 0 ? "text-success" : "text-danger")}>{formatPrice(d.profit)}</td>
                </tr>
              ))}
              {!r.by_day.length && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted">لا توجد مبيعات في هذه الفترة</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel title="طرق الدفع">
            <ul className="divide-y divide-border">
              {(Object.keys(paymentMethods) as PaymentMethod[]).map((k) => (
                <li key={k} className="flex justify-between px-4 py-2.5 text-sm">
                  <span>{paymentMethods[k].short}</span>
                  <span className="num font-semibold">{r.by_payment[k] ?? 0} طلب</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <Panel title="الأكثر مبيعاً في الفترة" className="mt-6">
        <Table>
          <thead>
            <tr>
              <th>المنتج</th>
              <th>الكمية</th>
              <th>الإيراد</th>
              <th>الخصم الممنوح</th>
              <th>الربح</th>
            </tr>
          </thead>
          <tbody>
            {r.top_products.map((p) => (
              <tr key={p.name}>
                <td>{p.name}</td>
                <td className="num">{p.quantity}</td>
                <td className="num">{formatPrice(p.revenue)}</td>
                <td className="num text-warning">{formatPrice(p.discount)}</td>
                <td className="num font-semibold text-success">{formatPrice(p.profit)}</td>
              </tr>
            ))}
            {!r.top_products.length && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted">لا توجد مبيعات في هذه الفترة</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
