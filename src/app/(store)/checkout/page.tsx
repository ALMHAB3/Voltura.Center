import type { Metadata } from "next";
import { getCities } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "@/components/cart/checkout-form";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata: Metadata = { title: "إتمام الطلب", robots: { index: false } };

export default async function CheckoutPage() {
  const [cities, current] = await Promise.all([getCities(), getCurrentUser()]);
  let addresses: Awaited<ReturnType<typeof loadAddresses>> = [];
  if (current) addresses = await loadAddresses();

  return (
    <div className="mx-auto max-w-6xl px-4 pt-5 lg:px-6">
      <Breadcrumbs items={[{ label: "السلة", href: "/cart" }, { label: "إتمام الطلب" }]} />
      <h1 className="mb-5 text-2xl font-bold sm:text-3xl">إتمام الطلب</h1>
      <CheckoutForm
        cities={cities}
        addresses={addresses}
        defaults={{ name: current?.profile?.full_name ?? "", phone: current?.profile?.phone ?? "" }}
      />
    </div>
  );
}

async function loadAddresses() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("addresses")
    .select("id, label, recipient_name, phone, city_id, details, is_default")
    .order("is_default", { ascending: false });
  return data ?? [];
}
