import { Banknote, MessageCircle, ShieldCheck, Truck } from "lucide-react";

const features = [
  { icon: Truck, title: "توصيل لكل ليبيا", text: "من مصراتة إلى كل المدن، والرسوم تظهر قبل الطلب" },
  { icon: ShieldCheck, title: "ضمان حقيقي", text: "منتجات أصلية مع ضمان مكتوب على كل جهاز" },
  { icon: Banknote, title: "ادفع كما يناسبك", text: "كاش عند الاستلام، حوالة مصرفية، ون باي أو LyPay" },
  { icon: MessageCircle, title: "تأكيد على واتساب", text: "نؤكد كل طلب معك مباشرة قبل الشحن" },
];

export function Features() {
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {features.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:gap-3.5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary-strong">
            <Icon size={22} aria-hidden />
          </span>
          <span>
            <span className="block text-sm font-bold text-foreground">{title}</span>
            <span className="block text-xs leading-5 text-muted">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
