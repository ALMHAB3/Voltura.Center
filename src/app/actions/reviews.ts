"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  productId: z.number().int().positive(),
  slug: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export async function submitReview(input: z.infer<typeof schema>): Promise<{ ok: boolean; message: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "اختر تقييماً من 1 إلى 5" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "سجّل دخولك لكتابة تقييم" };

  const { error } = await supabase.from("reviews").upsert(
    {
      product_id: parsed.data.productId,
      user_id: user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    },
    { onConflict: "product_id,user_id" },
  );
  if (error) return { ok: false, message: "التقييم متاح فقط لمن استلم هذا المنتج" };
  revalidatePath(`/product/${parsed.data.slug}`);
  return { ok: true, message: "شكراً، تم نشر تقييمك" };
}
