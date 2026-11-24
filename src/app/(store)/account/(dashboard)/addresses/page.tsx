import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCities } from "@/lib/queries";
import { AddressList } from "@/components/account/address-list";

export const metadata: Metadata = { title: "عناويني", robots: { index: false } };

export default async function AddressesPage() {
  const supabase = await createClient();
  const [{ data }, cities] = await Promise.all([
    supabase
      .from("addresses")
      .select("id, label, recipient_name, phone, details, is_default, city:cities(name)")
      .order("is_default", { ascending: false })
      .order("created_at"),
    getCities(),
  ]);
  return (
    <section>
      <h1 className="mb-4 text-xl font-bold">عناويني</h1>
      <AddressList addresses={data ?? []} cities={cities} />
    </section>
  );
}
