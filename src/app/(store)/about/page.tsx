import type { Metadata } from "next";
import { ProsePage } from "@/components/ui/prose-page";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "من نحن", description: site.description, alternates: { canonical: "/about" } };

// TODO: replace this text with the store's own story.
export default function AboutPage() {
  return (
    <ProsePage title="من نحن" intro={site.tagline}>
      <section>
        <h2>فولتورا سنتر</h2>
        <p>
          متجر إلكترونيات من مصراتة، نوفر اللابتوبات والهواتف والشاشات وقطع الكمبيوتر والإكسسوارات، ونوصلها إلى كل المدن الليبية. هذا النص
          مؤقت: استبدله بقصة المتجر الحقيقية.
        </p>
      </section>
      <section>
        <h2>ما نلتزم به</h2>
        <ul>
          <li>منتجات أصلية، مع ضمان واضح مكتوب على كل منتج.</li>
          <li>أسعار معلنة بالدينار الليبي، بدون رسوم مخفية؛ رسوم التوصيل تظهر قبل تأكيد الطلب.</li>
          <li>تأكيد كل طلب مع العميل على واتساب قبل الشحن.</li>
          <li>طرق دفع متعددة: كاش عند الاستلام، حوالة مصرفية، ون باي، و LyPay.</li>
        </ul>
      </section>
    </ProsePage>
  );
}
