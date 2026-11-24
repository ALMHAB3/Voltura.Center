"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { addressSchema, profileSchema } from "@/lib/validation";

type Result = { ok: boolean; message: string };

export async function updateProfile(input: unknown): Promise<Result> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "سجّل دخولك أولاً" };
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName, phone: parsed.data.phone })
    .eq("id", user.id);
  if (error) return { ok: false, message: "تعذّر حفظ البيانات" };
  revalidatePath("/account", "layout");
  return { ok: true, message: "تم حفظ بياناتك" };
}

export async function saveAddress(input: unknown): Promise<Result> {
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "سجّل دخولك أولاً" };
  const d = parsed.data;
  if (d.isDefault) await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  const { count } = await supabase.from("addresses").select("id", { count: "exact", head: true }).eq("user_id", user.id);
  const { error } = await supabase.from("addresses").insert({
    user_id: user.id,
    label: d.label,
    recipient_name: d.recipientName,
    phone: d.phone,
    city_id: d.cityId,
    details: d.details,
    is_default: d.isDefault || !count,
  });
  if (error) return { ok: false, message: "تعذّر حفظ العنوان" };
  revalidatePath("/account/addresses");
  return { ok: true, message: "تم حفظ العنوان" };
}

export async function deleteAddress(id: number) {
  const supabase = await createClient();
  await supabase.from("addresses").delete().eq("id", id);
  revalidatePath("/account/addresses");
}

export async function setDefaultAddress(id: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  await supabase.from("addresses").update({ is_default: true }).eq("id", id);
  revalidatePath("/account/addresses");
}
