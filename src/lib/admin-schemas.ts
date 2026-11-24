import { z } from "zod";

const slug = z
  .string()
  .trim()
  .min(2, "الرابط قصير جداً")
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "الرابط بأحرف إنجليزية صغيرة وأرقام وشرطات فقط، مثل asus-vivobook-15");

const optionalInt = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
  z.number().int().min(0).nullable(),
);

export const productSchema = z.object({
  name: z.string().trim().min(3, "اكتب اسم المنتج").max(200),
  slug,
  sku: z.string().trim().max(60).optional().or(z.literal("")),
  categoryId: z.coerce.number().int().positive("اختر القسم"),
  brandId: optionalInt,
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  price: z.coerce.number({ message: "أدخل السعر" }).int("السعر بدون كسور").positive("السعر أكبر من صفر"),
  discountPercent: z.coerce.number().int().min(0).max(90, "أقصى خصم 90%"),
  costPrice: optionalInt,
  stock: z.coerce.number().int().min(0, "المخزون لا يقل عن صفر"),
  warrantyMonths: z.coerce.number().int().min(0).max(120),
  offerEndsAt: z.string().optional().or(z.literal("")),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  specs: z.array(z.object({ key: z.string().trim().max(60), value: z.string().trim().max(200) })).max(40),
  images: z.array(z.object({ path: z.string().min(1) })).max(12),
});
export type ProductFormValues = z.input<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2, "اكتب اسم القسم").max(80),
  slug,
  icon: z.string().trim().min(1),
  parentId: optionalInt,
  sortOrder: z.coerce.number().int().default(0),
  description: z.string().trim().max(500).optional(),
  isActive: z.boolean(),
});

export const brandSchema = z.object({
  name: z.string().trim().min(1, "اكتب اسم الماركة").max(80),
  slug,
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean(),
});

export const bannerSchema = z.object({
  title: z.string().trim().min(2, "اكتب العنوان").max(120),
  subtitle: z.string().trim().max(200).optional(),
  imagePath: z.string().trim().min(1, "ارفع صورة البانر"),
  linkUrl: z.string().trim().max(300).optional(),
  buttonLabel: z.string().trim().max(40).optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean(),
});

export const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "الكود 3 أحرف على الأقل")
    .max(30)
    .transform((v) => v.toUpperCase())
    .refine((v) => /^[A-Z0-9_-]+$/.test(v), "الكود بأحرف إنجليزية وأرقام فقط"),
  type: z.enum(["percent", "fixed"]),
  value: z.coerce.number().int().positive("القيمة أكبر من صفر"),
  minSubtotal: z.coerce.number().int().min(0).default(0),
  maxDiscount: optionalInt,
  usageLimit: optionalInt,
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
});

export const citySchema = z.object({
  name: z.string().trim().min(2).max(60),
  deliveryFee: z.coerce.number().int().min(0, "الرسوم لا تقل عن صفر"),
  deliveryDays: z.string().trim().max(40).optional(),
  vanexCityId: optionalInt,
  isActive: z.boolean(),
});
