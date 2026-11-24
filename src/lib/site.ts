/** Store identity and contact details. Edit here; every page reads from this file. */
export const site = {
  name: "Voltura Center",
  nameAr: "فولتورا سنتر",
  tagline: "لابتوبات، هواتف، إكسسوارات وقطع كمبيوتر بضمان حقيقي وتوصيل لكل ليبيا",
  description:
    "فولتورا سنتر: متجر إلكترونيات في مصراتة. لابتوبات وهواتف وشاشات وقطع كمبيوتر وإكسسوارات، الدفع عند الاستلام أو بالحوالة، والتوصيل لكل المدن الليبية.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  phoneDisplay: "093 169 4345",
  phoneIntl: "+218931694345",
  whatsapp: "218931694345",
  email: "info@volturacenter.ly",
  address: "ليبيا، مصراتة",
  social: {
    instagram: "https://www.instagram.com/voltura_center",
    facebook: "https://www.facebook.com/share/1A88CMeP3q/",
  },
} as const;

export const paymentMethods = {
  cash: {
    label: "الدفع نقداً عند الاستلام",
    short: "كاش عند الاستلام",
    instructions: "ادفع للمندوب عند استلام طلبك.",
  },
  bank_transfer: {
    label: "حوالة مصرفية",
    short: "حوالة مصرفية",
    // TODO: replace with the store's real bank details.
    instructions: "حوّل المبلغ إلى حساب المتجر (اسم المصرف ورقم الحساب يُضافان هنا)، ثم أرسل صورة الإيصال على واتساب.",
  },
  onepay: {
    label: "ون باي (OnePay)",
    short: "ون باي",
    // TODO: replace with the store's real OnePay number.
    instructions: "حوّل المبلغ إلى رقم ون باي الخاص بالمتجر (يُضاف هنا)، ثم أرسل صورة العملية على واتساب.",
  },
  lypay: {
    label: "LyPay",
    short: "LyPay",
    // TODO: replace with the store's real LyPay account.
    instructions: "حوّل المبلغ إلى حساب LyPay الخاص بالمتجر (يُضاف هنا)، ثم أرسل صورة العملية على واتساب.",
  },
} as const;

export type PaymentMethod = keyof typeof paymentMethods;

export const orderStatuses = {
  pending: { label: "بانتظار التأكيد", tone: "warning" },
  confirmed: { label: "تم التأكيد", tone: "info" },
  processing: { label: "قيد التجهيز", tone: "info" },
  shipped: { label: "خرج للتوصيل", tone: "info" },
  delivered: { label: "تم التسليم", tone: "success" },
  cancelled: { label: "ملغي", tone: "danger" },
} as const;

export type OrderStatus = keyof typeof orderStatuses;
