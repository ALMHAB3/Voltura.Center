import { z } from "zod";

/** Libyan mobile: 091/092/093/094/095 + 7 digits. Accepts +218 / 00218 prefixes and spaces. */
export const libyanPhone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s\-()]/g, "").replace(/^(\+|00)?218/, "0"))
  .refine((v) => /^09[1-6]\d{7}$/.test(v), "أدخل رقم هاتف ليبي صحيح، مثال: 0912345678");

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(3, "اكتب الاسم الكامل").max(80),
  phone: libyanPhone,
  cityId: z.coerce.number({ message: "اختر المدينة" }).int().positive("اختر المدينة"),
  address: z.string().trim().min(5, "اكتب العنوان بالتفصيل (المنطقة، الشارع، أقرب معلم)").max(300),
  notes: z.string().trim().max(500).optional(),
  paymentMethod: z.enum(["cash", "bank_transfer", "onepay", "lypay"], { message: "اختر طريقة الدفع" }),
  couponCode: z.string().trim().max(40).optional(),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("أدخل بريداً إلكترونياً صحيحاً"),
  password: z.string().min(1, "أدخل كلمة المرور"),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(3, "اكتب الاسم الكامل").max(80),
    phone: libyanPhone,
    email: z.string().trim().email("أدخل بريداً إلكترونياً صحيحاً"),
    password: z.string().min(8, "كلمة المرور 8 أحرف على الأقل"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "كلمتا المرور غير متطابقتين" });

export const emailSchema = z.object({ email: z.string().trim().email("أدخل بريداً إلكترونياً صحيحاً") });

export const newPasswordSchema = z
  .object({ password: z.string().min(8, "كلمة المرور 8 أحرف على الأقل"), confirm: z.string() })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "كلمتا المرور غير متطابقتين" });

export const profileSchema = z.object({
  fullName: z.string().trim().min(3, "اكتب الاسم الكامل").max(80),
  phone: libyanPhone,
});

export const addressSchema = z.object({
  label: z.string().trim().min(2, "اكتب اسماً للعنوان").max(30),
  recipientName: z.string().trim().min(3, "اكتب اسم المستلم").max(80),
  phone: libyanPhone,
  cityId: z.coerce.number().int().positive("اختر المدينة"),
  details: z.string().trim().min(5, "اكتب العنوان بالتفصيل").max(300),
  isDefault: z.boolean().optional(),
});

export const trackSchema = z.object({
  orderNumber: z.string().trim().min(4, "أدخل رقم الطلب"),
  phone: libyanPhone,
});
