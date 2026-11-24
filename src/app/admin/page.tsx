import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, formatNumber, formatPrice } from "@/lib/format";
import { AdminPageHeader, Panel, StatCard, Table } from "@/components/admin/ui";
import { StatusBadge } from "@/components/cart/order-details";

function tripoliDate(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Tripoli" }).format(d);
}

export default async function AdminHome() {
  const supabase = await createClient();
  const today = tripoliDate();
  const monthStart = today.slice(0, 8) + "01";
  const [{ data: todayReport }, { data: monthReport }, { count: pending }, { data: lowStock }, { data: recent }] = await Promise.all([
    supabase.rpc("admin_report", { p_from: today, p_to: today }),
    supabase.rpc("admin_report", { p_from: monthStart, p_to: today }),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("products").select("id, name, stock, sold_count").eq("is_active", true).lte("stock", 3).order("stock").limit(8),
    supabase.from("orders").select("id, order_number, customer_name, city_name, total, status, created_at").order("created_at", { ascending: false }).limit(8),
  ]);
  const t = todayReport as Record<string, number> | null;
  const m = monthReport as Record<string, number> | null;

  return (
    <div>
      <AdminPageHeader title="نظرة عامة" description="أرقام اليوم والشهر الحالي (الطلبات الملغاة غير محسوبة)." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="مبيعات اليوم" value={formatPrice(t?.net_sales)} hint={`${formatNumber(t?.orders_count)} طلب`} />
        <StatCard label="مبيعات الشهر" value={formatPrice(m?.net_sales)} hint={`${formatNumber(m?.orders_count)} طلب`} />
        <StatCard label="ربح الشهر" value={formatPrice(m?.profit)} tone="success" hint="بعد التكلفة والخصومات" />
        <StatCard label="طلبات بانتظار التأكيد" value={formatNumber(pending)} tone={pending ? "warning" : undefined} hint={<Link href="/admin/orders?status=pending" className="text-primary-strong">عرضها</Link>} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="أحدث الطلبات" actions={<Link href="/admin/orders" className="text-sm font-semibold text-primary-strong">كل الطلبات</Link>}>
          <Table>
            <thead>
              <tr>
                <th>الطلب</th>
                <th>العميل</th>
                <th>الإجمالي</th>
                <th>الحالة</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {(recent ?? []).map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link href={`/admin/orders/${o.id}`} className="num font-semibold text-primary-strong">
                      {o.order_number}
                    </Link>
                  </td>
                  <td>
                    {o.customer_name}
                    <span className="block text-xs text-muted">{o.city_name}</span>
                  </td>
                  <td className="num font-semibold">{formatPrice(o.total)}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td className="text-xs text-muted">{formatDateTime(o.created_at)}</td>
                </tr>
              ))}
              {!recent?.length && (
                <tr>
                  <td colSpan={5} className="text-center text-muted">لا توجد طلبات بعد</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Panel>

        <Panel title="منتجات قاربت على النفاد">
          <ul className="divide-y divide-border">
            {(lowStock ?? []).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <Link href={`/admin/products/${p.id}`} className="line-clamp-1 hover:text-primary-strong">
                  {p.name}
                </Link>
                <span className={`num flex shrink-0 items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold ${p.stock === 0 ? "bg-danger/15 text-danger" : "bg-warning/15 text-warning"}`}>
                  {p.stock === 0 && <AlertTriangle size={12} aria-hidden />}
                  {p.stock === 0 ? "نفد" : `${p.stock} متبقي`}
                </span>
              </li>
            ))}
            {!lowStock?.length && <li className="px-4 py-6 text-center text-sm text-muted">كل المنتجات متوفرة بكميات جيدة</li>}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
