import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/** Current user and profile, verified with the Supabase Auth server. Cached per request. */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role")
    .eq("id", user.id)
    .single();
  return { user, profile, isAdmin: profile?.role === "admin" };
});

export async function requireUser(next = "/account") {
  const current = await getCurrentUser();
  if (!current) redirect(`/account/login?next=${encodeURIComponent(next)}`);
  return current;
}

/** Use at the top of every admin page and admin server action. Non-admins get a 404. */
export async function requireAdmin() {
  const current = await getCurrentUser();
  if (!current) redirect("/account/login?next=/admin");
  if (!current.isAdmin) notFound();
  return current;
}
