import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Instant search suggestions for the header search box. */
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 80);
  if (q.length < 2) return NextResponse.json({ results: [] });

  const supabase = await createClient();
  const { data } = await supabase
    .rpc("search_products", { p_query: q, p_limit: 6 })
    .select("id, name, slug, price, sale_price, product_images(path, sort_order)");

  const results = (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    salePrice: p.sale_price,
    image: [...(p.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0]?.path ?? null,
  }));
  return NextResponse.json({ results });
}
