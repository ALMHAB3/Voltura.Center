import "server-only";
import { cache } from "react";
import { createClient } from "./supabase/server";
import { normalizeSearch } from "./format";
import type { Database } from "./supabase/database.types";

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Brand = Database["public"]["Tables"]["brands"]["Row"];

const CARD_SELECT =
  "id, name, slug, price, sale_price, discount_percent, stock, rating_avg, rating_count, sold_count, is_featured, offer_ends_at, created_at, brand:brands(name, slug), product_images(path, sort_order)";

type CardRow = {
  id: number;
  name: string;
  slug: string;
  price: number;
  sale_price: number;
  discount_percent: number;
  stock: number;
  rating_avg: number;
  rating_count: number;
  sold_count: number;
  is_featured: boolean;
  offer_ends_at: string | null;
  created_at: string;
  brand: { name: string; slug: string } | null;
  product_images: { path: string; sort_order: number }[];
};

export type ProductCardData = Omit<CardRow, "product_images"> & { image: string | null };

function toCard(row: CardRow): ProductCardData {
  const { product_images, ...rest } = row;
  const first = [...(product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0];
  return { ...rest, rating_avg: Number(rest.rating_avg), image: first?.path ?? null };
}

export const getCategories = cache(async (): Promise<Category[]> => {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").eq("is_active", true).order("sort_order");
  return data ?? [];
});

export async function getCategoryTree() {
  const all = await getCategories();
  const roots = all.filter((c) => c.parent_id === null);
  return roots.map((root) => ({ ...root, children: all.filter((c) => c.parent_id === root.id) }));
}

export const getBrands = cache(async (): Promise<Brand[]> => {
  const supabase = await createClient();
  const { data } = await supabase.from("brands").select("*").eq("is_active", true).order("sort_order");
  return data ?? [];
});

export async function getBanners() {
  const supabase = await createClient();
  const { data } = await supabase.from("banners").select("*").eq("is_active", true).order("sort_order");
  return data ?? [];
}

export async function getCities() {
  const supabase = await createClient();
  const { data } = await supabase.from("cities").select("id, name, delivery_fee, delivery_days").eq("is_active", true).order("sort_order");
  return data ?? [];
}

export async function getProductCards(
  kind: "featured" | "latest" | "offers" | "bestsellers",
  limit = 8,
): Promise<ProductCardData[]> {
  const supabase = await createClient();
  let query = supabase.from("products").select(CARD_SELECT).eq("is_active", true);
  if (kind === "featured") query = query.eq("is_featured", true).order("created_at", { ascending: false });
  if (kind === "latest") query = query.order("created_at", { ascending: false });
  if (kind === "offers") query = query.gt("discount_percent", 0).gt("stock", 0).order("discount_percent", { ascending: false });
  if (kind === "bestsellers") query = query.order("sold_count", { ascending: false });
  const { data } = await query.limit(limit);
  return ((data ?? []) as unknown as CardRow[]).map(toCard);
}

/** The earliest offer end date among discounted products, for the home page countdown. */
export async function getNextOfferEnd(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("offer_ends_at")
    .eq("is_active", true)
    .gt("discount_percent", 0)
    .gt("offer_ends_at", new Date().toISOString())
    .order("offer_ends_at")
    .limit(1)
    .maybeSingle();
  return data?.offer_ends_at ?? null;
}

// ───────────────────────── Listing with filters ─────────────────────────

export const SORTS = {
  newest: "الأحدث",
  popular: "الأكثر مبيعاً",
  price_asc: "السعر: من الأقل",
  price_desc: "السعر: من الأعلى",
  rating: "الأعلى تقييماً",
} as const;
export type SortKey = keyof typeof SORTS;

export type ListingParams = {
  q?: string;
  categorySlug?: string;
  brands: string[];
  min?: number;
  max?: number;
  inStock: boolean;
  offers: boolean;
  spec: Record<string, string>;
  sort: SortKey;
  page: number;
};

export const PAGE_SIZE = 12;

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseListingParams(sp: SearchParams, categorySlug?: string): ListingParams {
  const num = (v?: string) => {
    const n = Number(v);
    return v && Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined;
  };
  const sort = first(sp.sort) as SortKey;
  const specValues = sp.spec ? (Array.isArray(sp.spec) ? sp.spec : [sp.spec]) : [];
  const spec: Record<string, string> = {};
  for (const entry of specValues) {
    const i = entry.indexOf(":");
    if (i > 0) spec[entry.slice(0, i)] = entry.slice(i + 1);
  }
  return {
    q: first(sp.q)?.slice(0, 80) || undefined,
    categorySlug,
    brands: (first(sp.brand) ?? "").split(",").filter(Boolean),
    min: num(first(sp.min)),
    max: num(first(sp.max)),
    inStock: first(sp.stock) === "1",
    offers: first(sp.offers) === "1",
    spec,
    sort: sort && sort in SORTS ? sort : "newest",
    page: Math.max(1, num(first(sp.page)) ?? 1),
  };
}

export async function getListing(params: ListingParams) {
  const supabase = await createClient();
  const [categories, brands] = await Promise.all([getCategories(), getBrands()]);

  let categoryIds: number[] | undefined;
  const category = params.categorySlug ? categories.find((c) => c.slug === params.categorySlug) : undefined;
  if (category) {
    categoryIds = [category.id, ...categories.filter((c) => c.parent_id === category.id).map((c) => c.id)];
  }

  let query = supabase.from("products").select(CARD_SELECT, { count: "exact" }).eq("is_active", true);

  if (categoryIds) query = query.in("category_id", categoryIds);
  if (params.q) {
    const term = normalizeSearch(params.q).replace(/[%_,()*\\]/g, " ").trim();
    if (term) query = query.ilike("search_text", `%${term}%`);
  }
  if (params.brands.length) {
    const ids = brands.filter((b) => params.brands.includes(b.slug)).map((b) => b.id);
    query = query.in("brand_id", ids.length ? ids : [-1]);
  }
  if (params.min !== undefined) query = query.gte("sale_price", params.min);
  if (params.max !== undefined) query = query.lte("sale_price", params.max);
  if (params.inStock) query = query.gt("stock", 0);
  if (params.offers) query = query.gt("discount_percent", 0);
  for (const [key, value] of Object.entries(params.spec)) {
    query = query.contains("specs", { [key]: value });
  }

  switch (params.sort) {
    case "price_asc":
      query = query.order("sale_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("sale_price", { ascending: false });
      break;
    case "popular":
      query = query.order("sold_count", { ascending: false });
      break;
    case "rating":
      query = query.order("rating_avg", { ascending: false }).order("rating_count", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }
  query = query.order("id", { ascending: false });

  const from = (params.page - 1) * PAGE_SIZE;
  const { data, count } = await query.range(from, from + PAGE_SIZE - 1);

  return {
    category: category ?? null,
    products: ((data ?? []) as unknown as CardRow[]).map(toCard),
    total: count ?? 0,
    pages: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)),
  };
}

/** Filter options for a listing: brands present and spec values with a small number of choices. */
export async function getListingFacets(categorySlug?: string) {
  const supabase = await createClient();
  const [categories, brands] = await Promise.all([getCategories(), getBrands()]);
  let query = supabase.from("products").select("brand_id, specs, sale_price").eq("is_active", true).limit(1000);
  const category = categorySlug ? categories.find((c) => c.slug === categorySlug) : undefined;
  if (category) {
    query = query.in("category_id", [category.id, ...categories.filter((c) => c.parent_id === category.id).map((c) => c.id)]);
  }
  const { data } = await query;
  const rows = data ?? [];

  const brandIds = new Set(rows.map((r) => r.brand_id));
  const specMap = new Map<string, Map<string, number>>();
  for (const row of rows) {
    for (const [key, value] of Object.entries((row.specs ?? {}) as Record<string, unknown>)) {
      if (typeof value !== "string") continue;
      const values = specMap.get(key) ?? new Map<string, number>();
      values.set(value, (values.get(value) ?? 0) + 1);
      specMap.set(key, values);
    }
  }
  const specs = category
    ? [...specMap.entries()]
        .filter(([, values]) => values.size >= 2 && values.size <= 10)
        .slice(0, 5)
        .map(([key, values]) => ({
          key,
          values: [...values.entries()].sort((a, b) => b[1] - a[1]).map(([value, count]) => ({ value, count })),
        }))
    : [];

  const prices = rows.map((r) => r.sale_price);
  return {
    brands: brands.filter((b) => brandIds.has(b.id)),
    specs,
    priceMax: prices.length ? Math.max(...prices) : 0,
  };
}

// ───────────────────────── Product page ─────────────────────────

export const getProduct = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(
      "*, brand:brands(id, name, slug), category:categories(id, name, slug, parent_id), product_images(id, path, alt, sort_order)",
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (!data) return null;
  return {
    ...data,
    rating_avg: Number(data.rating_avg),
    specs: (data.specs ?? {}) as Record<string, string>,
    product_images: [...(data.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
  };
});

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProduct>>>;

export async function getRelatedProducts(productId: number, categoryId: number | null, limit = 4) {
  if (!categoryId) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(CARD_SELECT)
    .eq("is_active", true)
    .eq("category_id", categoryId)
    .neq("id", productId)
    .order("sold_count", { ascending: false })
    .limit(limit);
  return ((data ?? []) as unknown as CardRow[]).map(toCard);
}

export async function getReviews(productId: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, user_id, author_name")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(50);
  return data ?? [];
}

/** Cards for a list of ids (cart, wishlist), keeping current price and stock from the database. */
export async function getProductCardsByIds(ids: number[]): Promise<ProductCardData[]> {
  if (!ids.length) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("products").select(CARD_SELECT).in("id", ids).eq("is_active", true);
  return ((data ?? []) as unknown as CardRow[]).map(toCard);
}
