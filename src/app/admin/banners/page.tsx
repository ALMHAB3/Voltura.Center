import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { imageUrl } from "@/lib/images";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { BannerForm } from "@/components/admin/banner-form";
import { EditDetails } from "@/components/admin/fields";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteRow } from "@/app/actions/admin";

export const metadata = { title: "البانرات" };

export default async function BannersPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("banners").select("*").order("sort_order");
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="بانرات الصفحة الرئيسية" />
      <Panel title="بانر جديد">
        <div className="p-4">
          <BannerForm />
        </div>
      </Panel>
      <Panel>
        <ul className="divide-y divide-border">
          {(data ?? []).map((b) => (
            <li key={b.id} className="px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="relative h-14 w-36 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                  <Image src={imageUrl(b.image_path)!} alt="" fill sizes="144px" className="object-cover" />
                </span>
                <span className="flex-1">
                  <span className="block font-semibold">{b.title}</span>
                  <span className="text-xs text-muted">{b.is_active ? "ظاهر" : "مخفي"} · ترتيب {b.sort_order}</span>
                </span>
                <DeleteButton onDelete={deleteRow.bind(null, "banners", b.id)} />
              </div>
              <EditDetails>
                <BannerForm banner={b} />
              </EditDetails>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
