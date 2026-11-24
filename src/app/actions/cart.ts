"use server";

import { createClient } from "@/lib/supabase/server";
import { getProductCardsByIds, type ProductCardData } from "@/lib/queries";

export type CartLine = { productId: number; quantity: number };

const MAX_QTY = 99;

async function getCartId(create: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, cartId: null };
  const { data: existing } = await supabase.from("carts").select("id").eq("user_id", user.id).maybeSingle();
  if (existing || !create) return { supabase, cartId: existing?.id ?? null };
  const { data: created } = await supabase.from("carts").insert({ user_id: user.id }).select("id").single();
  return { supabase, cartId: created?.id ?? null };
}

/** The signed-in customer's saved cart. Empty for guests. */
export async function getServerCart(): Promise<CartLine[]> {
  const { supabase, cartId } = await getCartId(false);
  if (!cartId) return [];
  const { data } = await supabase
    .from("cart_items")
    .select("product_id, quantity")
    .eq("cart_id", cartId)
    .order("created_at");
  return (data ?? []).map((r) => ({ productId: r.product_id, quantity: r.quantity }));
}

export async function setCartQuantity(productId: number, quantity: number): Promise<{ ok: boolean }> {
  if (!Number.isInteger(productId) || !Number.isInteger(quantity)) return { ok: false };
  const { supabase, cartId } = await getCartId(true);
  if (!cartId) return { ok: false };
  if (quantity <= 0) {
    await supabase.from("cart_items").delete().eq("cart_id", cartId).eq("product_id", productId);
  } else {
    await supabase
      .from("cart_items")
      .upsert({ cart_id: cartId, product_id: productId, quantity: Math.min(quantity, MAX_QTY) });
  }
  return { ok: true };
}

export async function clearServerCart() {
  const { supabase, cartId } = await getCartId(false);
  if (cartId) await supabase.from("cart_items").delete().eq("cart_id", cartId);
}

/** Merges a guest cart (from localStorage) into the saved cart after sign-in. Quantities add up. */
export async function mergeGuestCart(lines: CartLine[]): Promise<CartLine[]> {
  const { supabase, cartId } = await getCartId(true);
  if (!cartId) return lines;
  const existing = await getServerCart();
  const merged = new Map(existing.map((l) => [l.productId, l.quantity]));
  for (const line of lines.slice(0, 50)) {
    if (!Number.isInteger(line.productId) || !Number.isInteger(line.quantity) || line.quantity < 1) continue;
    merged.set(line.productId, Math.min(MAX_QTY, (merged.get(line.productId) ?? 0) + line.quantity));
  }
  const rows = [...merged.entries()].map(([product_id, quantity]) => ({ cart_id: cartId, product_id, quantity }));
  if (rows.length) await supabase.from("cart_items").upsert(rows);
  return getServerCart();
}

/** Current price, stock and image for the items in a cart. */
export async function getCartProducts(ids: number[]): Promise<ProductCardData[]> {
  const clean = ids.filter((id) => Number.isInteger(id)).slice(0, 50);
  return getProductCardsByIds(clean);
}
