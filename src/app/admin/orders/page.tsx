import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { orderStatuses, paymentMethods } from "@/lib/site";
import { formatDateTime, formatPrice } from "@/lib/format";
import { AdminPageHeader, Panel, Table } from "@/components/admin/ui";
import { StatusBadge } from "@/components/cart/order-details";
import { Pagination } from "@/components/listing/pagination";
import { cn } from "@/lib/cn";

export const metadata = { title: "الطلبات" };
const PAGE = 20;

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" && sp.status in orderStatuses ? (sp.status as keyof typeof orderStatuses) : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim().replace(/[%,()]/g, "") : "";
  const page = Math.max(1, Number(sp.page) || 1);

  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("id, order_number, customer_name, phone, city_name, total, status, payment_method, created_at", { count: "exact" })
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  if (q) query = query.or(`order_number.ilike.%${q}%,phone.ilike.%${q}%,customer_name.ilike.%${q}%`);
  const { data: orders, count } = await query.range((page - 1) * PAGE, page * PAGE - 1);

  const tabs = [{ key: undefined, label: "الكل" }, ...Object.entries(orderStatuses).map(([key, s]) => ({ key, label: s.label }))];

  return (
    <div>
      <AdminPageHeader title="الطلبات" description={`${count ?? 0} طلب`} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <Link
            key={t.label}
            href={t.key ? `/admin/orders?status=${t.key}` : "/admin/orders"}
            className={cn("rounded-xl px-3 py-1.5 text-sm font-medium", status === t.key ? "bg-ink text-primary" : "bg-surface hover:bg-surface-2")}
          >
            {t.label}
          </Link>
        ))}
        <form className="ms-auto" action="/admin/orders">
          {status && <input type="hidden" name="status" value={status} />}
          <label htmlFor="order-q" className="sr-only">بحث</label>
          <input id="order-q" name="q" defaultValue={q} placeholder="رقم الطلب، الهاتف أو الاسم" className="h-9 w-64 rounded-xl border border-border bg-surface px-3 text-sm" />
        </form>
      </div>
      <Panel>
        <Table>
          <thead>
            <tr>
              <th>الطلب</th>
              <th>العميل</th>
              <th>المدينة</th>
              <th>الدفع</th>
              <th>الإجمالي</th>
              <th>الحالة</th>
              <th>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => (
              <tr key={o.id}>
                <td>
                  <Link href={`/admin/orders/${o.id}`} className="num font-semibold text-primary-strong">{o.order_number}</Link>
                </td>
                <td>
                  {o.customer_name}
                  <span className="num block text-xs text-muted" dir="ltr" style={{ textAlign: "end" }}>{o.phone}</span>
                </td>
                <td>{o.city_name}</td>
                <td className="text-xs">{paymentMethods[o.payment_method].short}</td>
                <td className="num font-semibold">{formatPrice(o.total)}</td>
                <td><StatusBadge status={o.status} /></td>
                <td className="text-xs text-muted">{formatDateTime(o.created_at)}</td>
              </tr>
            ))}
            {!orders?.length && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-muted">لا توجد طلبات</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Panel>
      <Pagination page={page} pages={Math.max(1, Math.ceil((count ?? 0) / PAGE))} basePath="/admin/orders" searchParams={sp} />
    </div>
  );
}
