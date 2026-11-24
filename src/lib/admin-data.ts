import "server-only";
import { createClient } from "./supabase/server";

export async function getAdminOptions() {
  const supabase = await createClient();
  const [{ data: categories }, { data: brands }] = await Promise.all([
    supabase.from("categories").select("id, name, parent_id").order("sort_order"),
    supabase.from("brands").select("id, name").order("sort_order"),
  ]);
  return { categories: categories ?? [], brands: brands ?? [] };
}
