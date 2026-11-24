import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/lib/site";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/ui/brand-icons";
import { ContactForm } from "@/components/store/contact-form";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description: `تواصل مع ${site.nameAr} على واتساب ${site.phoneDisplay} أو عبر البريد ${site.email}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const channels = [
    { icon: WhatsAppIcon, label: "واتساب", value: site.phoneDisplay, href: whatsappLink(), ltr: true },
    { icon: Phone, label: "الهاتف", value: site.phoneDisplay, href: `tel:${site.phoneIntl}`, ltr: true },
    { icon: Mail, label: "البريد الإلكتروني", value: site.email, href: `mailto:${site.email}`, ltr: true },
    { icon: MapPin, label: "العنوان", value: site.address },
    { icon: InstagramIcon, label: "إنستغرام", value: "voltura_center", href: site.social.instagram, ltr: true },
    { icon: FacebookIcon, label: "فيسبوك", value: "Voltura Center", href: site.social.facebook, ltr: true },
  ];
  return (
    <div className="mx-auto max-w-5xl px-4 pt-5 lg:px-6">
      <Breadcrumbs items={[{ label: "تواصل معنا" }]} />
      <h1 className="text-2xl font-bold sm:text-3xl">تواصل معنا</h1>
      <p className="mt-2 text-muted">نرد على واتساب بأسرع وقت خلال ساعات العمل.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ul className="grid gap-3 sm:grid-cols-2">
          {channels.map(({ icon: Icon, label, value, href, ltr }) => (
            <li key={label} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ink text-primary">
                <Icon size={20} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-muted">{label}</span>
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" dir={ltr ? "ltr" : undefined} className="num block truncate font-semibold hover:text-primary-strong">
                    {value}
                  </a>
                ) : (
                  <span className="block font-semibold">{value}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <div className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-bold">أرسل لنا رسالة</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
