import type { Metadata } from "next";
import { getCities } from "@/lib/queries";
import { formatPrice } from "@/lib/format";
import { ProsePage } from "@/components/ui/prose-page";

export const metadata: Metadata = {
  title: "الشحن والتوصيل",
  description: "رسوم ومدة التوصيل إلى كل المدن الليبية من فولتورا سنتر.",
  alternates: { canonical: "/shipping" },
};

export default async function ShippingPage() {
  const cities = await getCities();
  return (
    <ProsePage title="الشحن والتوصيل" intro="نوصل إلى كل المدن الليبية. الرسوم تُضاف للطلب وتظهر قبل التأكيد.">
      <section>
        <h2>رسوم ومدة التوصيل</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="py-2 text-start font-medium">المدينة</th>
                <th className="py-2 text-start font-medium">الرسوم</th>
                <th className="py-2 text-start font-medium">المدة المتوقعة</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="py-2.5 font-semibold">{c.name}</td>
                  <td className="num py-2.5">{formatPrice(c.delivery_fee)}</td>
                  <td className="py-2.5 text-muted">{c.delivery_days ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2>كيف يتم التوصيل؟</h2>
        <ul>
          <li>بعد تأكيد الطلب على واتساب، نجهّزه ونسلّمه لشركة التوصيل.</li>
          <li>يتصل بك المندوب قبل الوصول. ادفع له إذا اخترت الدفع عند الاستلام.</li>
          <li>تابع حالة طلبك في أي وقت من صفحة «تتبع طلبك».</li>
        </ul>
      </section>
    </ProsePage>
  );
}
