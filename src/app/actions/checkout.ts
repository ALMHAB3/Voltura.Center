"use server";

import { createClient } from "@/lib/supabase/server";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation";
import type { CartLine } from "./cart";

type Result = { ok: true; orderId: string; orderNumber: string } | { ok: false; message: string; field?: string };

/** Creates the order. Prices, stock, coupon and delivery fee are all re-checked inside the database. */
export async function placeOrder(input: CheckoutInput, lines: CartLine[]): Promise<Result> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: issue.message, field: String(issue.path[0]) };
  }
  const items = lines
    .filter((l) => Number.isInteger(l.productId) && Number.isInteger(l.quantity) && l.quantity > 0)
    .map((l) => ({ product_id: l.productId, quantity: Math.min(l.quantity, 99) }));
  if (!items.length) return { ok: false, message: "السلة فارغة" };

  const d = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("place_order", {
    p_items: items,
    p_customer_name: d.customerName,
    p_phone: d.phone,
    p_city_id: d.cityId,
    p_address: d.address,
    p_payment_method: d.paymentMethod,
    p_notes: d.notes || undefined,
    p_coupon_code: d.couponCode || undefined,
  });

  if (error || !data) {
    // Messages raised inside place_order are written for customers.
    return { ok: false, message: error?.message ?? "تعذّر إنشاء الطلب، حاول مرة أخرى" };
  }
  const order = data as { id: string; order_number: string };
  return { ok: true, orderId: order.id, orderNumber: order.order_number };
}

export async function checkCoupon(code: string, subtotal: number) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("validate_coupon", { p_code: code, p_subtotal: Math.max(0, Math.floor(subtotal)) });
  return (data ?? { valid: false, message: "تعذّر التحقق من الكود" }) as {
    valid: boolean;
    message: string;
    discount?: number;
    code?: string;
  };
}
