"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleWishlist(productId: number): Promise<{ status: "added" | "removed" | "signin" }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "signin" };
  if (!Number.isInteger(productId)) return { status: "removed" };

  const { data: existing } = await supabase
    .from("wishlists")
    .select("product_id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId);
    revalidatePath("/wishlist");
    return { status: "removed" };
  }
  await supabase.from("wishlists").insert({ user_id: user.id, product_id: productId });
  revalidatePath("/wishlist");
  return { status: "added" };
}

export async function getWishlistIds(): Promise<number[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from("wishlists").select("product_id").eq("user_id", user.id);
  return (data ?? []).map((r) => r.product_id);
}
