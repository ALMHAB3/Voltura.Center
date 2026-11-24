import type { Metadata } from "next";
import { ProsePage } from "@/components/ui/prose-page";

export const metadata: Metadata = { title: "سياسة الإرجاع والاستبدال", alternates: { canonical: "/return-policy" } };

// TODO: the periods and conditions below are a starting draft. Adjust them to the store's actual policy.
export default function ReturnPolicyPage() {
  return (
    <ProsePage title="سياسة الإرجاع والاستبدال" intro="مسودة أولية: راجعها وعدّلها حسب سياسة المتجر الفعلية.">
      <section>
        <h2>الاستبدال بسبب عيب مصنعي</h2>
        <p>إذا ظهر عيب مصنعي خلال فترة الضمان المكتوبة على المنتج، نستبدله أو نصلحه بعد فحصه.</p>
      </section>
      <section>
        <h2>الإرجاع</h2>
        <ul>
          <li>يُقبل الإرجاع خلال 3 أيام من الاستلام إذا كان المنتج بحالته الأصلية وغلافه غير مفتوح.</li>
          <li>لا يُقبل إرجاع المنتجات المفتوحة أو المستخدمة إلا في حالة العيب المصنعي.</li>
          <li>رسوم التوصيل غير مستردة إلا إذا كان الخطأ من المتجر.</li>
        </ul>
      </section>
      <section>
        <h2>كيف أطلب الإرجاع؟</h2>
        <p>تواصل معنا على واتساب مع رقم الطلب وصورة المنتج، وسنرتب معك طريقة الاستلام.</p>
      </section>
    </ProsePage>
  );
}
