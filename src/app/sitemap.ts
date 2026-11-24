import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { site } from "@/lib/site";
import type { Database } from "@/lib/supabase/database.types";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Public data only, so a plain anonymous client is enough (no cookies needed).
  const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("slug, updated_at").eq("is_active", true),
    supabase.from("categories").select("slug").eq("is_active", true),
  ]);
  const url = (path: string) => `${site.url}${path}`;
  const alt = (path: string) => ({ languages: { ar: url(path) } });

  return [
    { url: url("/"), changeFrequency: "daily", priority: 1, alternates: alt("/") },
    { url: url("/products"), changeFrequency: "daily", priority: 0.9, alternates: alt("/products") },
    { url: url("/offers"), changeFrequency: "daily", priority: 0.8, alternates: alt("/offers") },
    ...["/about", "/contact", "/shipping", "/return-policy", "/track"].map((p) => ({ url: url(p), priority: 0.3, alternates: alt(p) })),
    ...(categories ?? []).map((c) => ({ url: url(`/category/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.8, alternates: alt(`/category/${c.slug}`) })),
    ...(products ?? []).map((p) => ({ url: url(`/product/${p.slug}`), lastModified: p.updated_at, priority: 0.7, alternates: alt(`/product/${p.slug}`) })),
  ];
}
