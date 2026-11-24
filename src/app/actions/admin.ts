"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  bannerSchema,
  brandSchema,
  categorySchema,
  citySchema,
  couponSchema,
  productSchema,
  type ProductFormValues,
} from "@/lib/admin-schemas";
import { createVanexShipment, vanexConfigured } from "@/lib/vanex";

export type ActionResult = { ok: boolean; message: string; id?: number };

const bool = (fd: FormData, key: string) => fd.get(key) === "on" || fd.get(key) === "true";
const str = (fd: FormData, key: string) => (fd.get(key) as string | null) ?? undefined;

function dbError(error: { code?: string; message: string }): ActionResult {
  if (error.code === "23505") return { ok: false, message: "القيمة مستخدمة مسبقاً (الرابط أو الكود أو SKU مكرر)" };
  if (error.code === "23503") return { ok: false, message: "لا يمكن الحذف: هذا العنصر مرتبط بطلبات أو منتجات" };
  return { ok: false, message: error.message };
}

function refreshStore() {
  revalidatePath("/", "layout");
}

// ───────────── Products ─────────────
export async function saveProduct(id: number | null, values: ProductFormValues): Promise<ActionResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const d = parsed.data;
  const supabase = await createClient();

  const row = {
    name: d.name,
    slug: d.slug,
    sku: d.sku || null,
    category_id: d.categoryId,
    brand_id: d.brandId,
    description: d.description || null,
    price: d.price,
    discount_percent: d.discountPercent,
    cost_price: d.costPrice,
    stock: d.stock,
    warranty_months: d.warrantyMonths,
    offer_ends_at: d.offerEndsAt ? new Date(d.offerEndsAt).toISOString() : null,
    is_featured: d.isFeatured,
    is_active: d.isActive,
    specs: Object.fromEntries(d.specs.filter((s) => s.key && s.value).map((s) => [s.key, s.value])),
  };

  let productId = id;
  if (id) {
    const { error } = await supabase.from("products").update(row).eq("id", id);
    if (error) return dbError(error);
  } else {
    const { data, error } = await supabase.from("products").insert(row).select("id").single();
    if (error) return dbError(error);
    productId = data.id;
  }

  // Replace the image list with the submitted order.
  await supabase.from("product_images").delete().eq("product_id", productId!);
  if (d.images.length) {
    const { error } = await supabase
      .from("product_images")
      .insert(d.images.map((img, i) => ({ product_id: productId!, path: img.path, alt: d.name, sort_order: i })));
    if (error) return dbError(error);
  }

  refreshStore();
  return { ok: true, message: "تم حفظ المنتج", id: productId! };
}

export async function deleteProduct(id: number): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return dbError(error);
  refreshStore();
  return { ok: true, message: "تم حذف المنتج" };
}

// ───────────── Categories / brands / banners / coupons / cities (FormData forms) ─────────────
export async function saveCategory(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: str(fd, "name"),
    slug: str(fd, "slug"),
    icon: str(fd, "icon"),
    parentId: str(fd, "parentId"),
    sortOrder: str(fd, "sortOrder") || 0,
    description: str(fd, "description"),
    isActive: bool(fd, "isActive"),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const d = parsed.data;
  const id = Number(fd.get("id")) || null;
  const row = { name: d.name, slug: d.slug, icon: d.icon, parent_id: d.parentId, sort_order: d.sortOrder, description: d.description || null, is_active: d.isActive };
  const supabase = await createClient();
  const { error } = id ? await supabase.from("categories").update(row).eq("id", id) : await supabase.from("categories").insert(row);
  if (error) return dbError(error);
  refreshStore();
  return { ok: true, message: "تم حفظ القسم" };
}

export async function saveBrand(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = brandSchema.safeParse({ name: str(fd, "name"), slug: str(fd, "slug"), sortOrder: str(fd, "sortOrder") || 0, isActive: bool(fd, "isActive") });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const d = parsed.data;
  const id = Number(fd.get("id")) || null;
  const row = { name: d.name, slug: d.slug, sort_order: d.sortOrder, is_active: d.isActive };
  const supabase = await createClient();
  const { error } = id ? await supabase.from("brands").update(row).eq("id", id) : await supabase.from("brands").insert(row);
  if (error) return dbError(error);
  refreshStore();
  return { ok: true, message: "تم حفظ الماركة" };
}

export async function saveBanner(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = bannerSchema.safeParse({
    title: str(fd, "title"),
    subtitle: str(fd, "subtitle"),
    imagePath: str(fd, "imagePath"),
    linkUrl: str(fd, "linkUrl"),
    buttonLabel: str(fd, "buttonLabel"),
    sortOrder: str(fd, "sortOrder") || 0,
    isActive: bool(fd, "isActive"),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const d = parsed.data;
  const id = Number(fd.get("id")) || null;
  const row = {
    title: d.title,
    subtitle: d.subtitle || null,
    image_path: d.imagePath,
    link_url: d.linkUrl || null,
    button_label: d.buttonLabel || null,
    sort_order: d.sortOrder,
    is_active: d.isActive,
  };
  const supabase = await createClient();
  const { error } = id ? await supabase.from("banners").update(row).eq("id", id) : await supabase.from("banners").insert(row);
  if (error) return dbError(error);
  refreshStore();
  return { ok: true, message: "تم حفظ البانر" };
}

export async function saveCoupon(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = couponSchema.safeParse({
    code: str(fd, "code"),
    type: str(fd, "type"),
    value: str(fd, "value"),
    minSubtotal: str(fd, "minSubtotal") || 0,
    maxDiscount: str(fd, "maxDiscount"),
    usageLimit: str(fd, "usageLimit"),
    expiresAt: str(fd, "expiresAt"),
    isActive: bool(fd, "isActive"),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const d = parsed.data;
  if (d.type === "percent" && d.value > 90) return { ok: false, message: "أقصى نسبة خصم 90%" };
  const id = Number(fd.get("id")) || null;
  const row = {
    code: d.code,
    type: d.type,
    value: d.value,
    min_subtotal: d.minSubtotal,
    max_discount: d.maxDiscount,
    usage_limit: d.usageLimit,
    // A plain date means "valid until the end of that day" in Libya (UTC+2).
    expires_at: d.expiresAt ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(d.expiresAt) ? `${d.expiresAt}T23:59:59+02:00` : d.expiresAt).toISOString() : null,
    is_active: d.isActive,
  };
  const supabase = await createClient();
  const { error } = id ? await supabase.from("coupons").update(row).eq("id", id) : await supabase.from("coupons").insert(row);
  if (error) return dbError(error);
  revalidatePath("/admin/coupons");
  return { ok: true, message: "تم حفظ الكوبون" };
}

export async function saveCity(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = citySchema.safeParse({
    name: str(fd, "name"),
    deliveryFee: str(fd, "deliveryFee"),
    deliveryDays: str(fd, "deliveryDays"),
    vanexCityId: str(fd, "vanexCityId"),
    isActive: bool(fd, "isActive"),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const d = parsed.data;
  const id = Number(fd.get("id")) || null;
  const row = { name: d.name, delivery_fee: d.deliveryFee, delivery_days: d.deliveryDays || null, vanex_city_id: d.vanexCityId, is_active: d.isActive };
  const supabase = await createClient();
  const { error } = id ? await supabase.from("cities").update(row).eq("id", id) : await supabase.from("cities").insert(row);
  if (error) return dbError(error);
  revalidatePath("/admin/cities");
  revalidatePath("/shipping");
  return { ok: true, message: "تم حفظ المدينة" };
}

const deletable = ["categories", "brands", "banners", "coupons", "cities"] as const;

export async function deleteRow(table: (typeof deletable)[number], id: number): Promise<ActionResult> {
  await requireAdmin();
  if (!deletable.includes(table)) return { ok: false, message: "غير مسموح" };
  const supabase = await createClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return dbError(error);
  refreshStore();
  return { ok: true, message: "تم الحذف" };
}

// ───────────── Orders ─────────────
const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;

export async function updateOrder(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const status = String(fd.get("status") ?? "") as (typeof statuses)[number];
  if (!statuses.includes(status)) return { ok: false, message: "حالة غير صحيحة" };
  const tracking = String(fd.get("vanexTracking") ?? "").trim() || null;
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status, vanex_tracking: tracking }).eq("id", id);
  if (error) return dbError(error);
  revalidatePath("/admin", "layout");
  return { ok: true, message: "تم تحديث الطلب" };
}

export async function sendToVanex(orderId: string): Promise<ActionResult> {
  await requireAdmin();
  if (!vanexConfigured()) return { ok: false, message: "أضف VANEX_API_URL و VANEX_API_KEY في الإعدادات أولاً" };
  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("*, order_items(*), city:cities(vanex_city_id)").eq("id", orderId).single();
  if (!order) return { ok: false, message: "الطلب غير موجود" };
  const result = await createVanexShipment(order);
  if (!result.ok) return { ok: false, message: result.message };
  await supabase.from("orders").update({ vanex_tracking: result.tracking, status: "shipped" }).eq("id", orderId);
  revalidatePath("/admin", "layout");
  return { ok: true, message: `تم إنشاء الشحنة: ${result.tracking}` };
}
