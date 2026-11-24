import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { site, paymentMethods } from "@/lib/site";
import { getCategoryTree } from "@/lib/queries";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/ui/brand-icons";
import { whatsappLink } from "@/lib/whatsapp";

const help = [
  { href: "/about", label: "من نحن" },
  { href: "/contact", label: "تواصل معنا" },
  { href: "/track", label: "تتبع طلبك" },
  { href: "/shipping", label: "الشحن والتوصيل" },
  { href: "/return-policy", label: "سياسة الإرجاع والاستبدال" },
];

export async function Footer() {
  const tree = await getCategoryTree();
  return (
    <footer className="mt-16 bg-ink-gradient pb-20 text-ink-foreground sm:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-6">
        <div className="flex flex-col gap-4">
          <Image src="/brand/logo-full.png" alt={site.name} width={532} height={485} className="h-24 w-auto self-start" />
          <p className="max-w-xs text-sm leading-7 text-ink-muted">{site.tagline}.</p>
          <div className="flex gap-2">
            {[
              { href: site.social.instagram, label: "إنستغرام", icon: InstagramIcon },
              { href: site.social.facebook, label: "فيسبوك", icon: FacebookIcon },
              { href: whatsappLink(), label: "واتساب", icon: WhatsAppIcon },
            ].map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex size-10 items-center justify-center rounded-xl bg-white/10 transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold text-primary">الأقسام</h2>
          <ul className="flex flex-col gap-2.5 text-sm text-ink-muted">
            {tree.map((c) => (
              <li key={c.id}>
                <Link href={`/category/${c.slug}`} className="hover:text-ink-foreground">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/offers" className="hover:text-ink-foreground">
                العروض
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold text-primary">المساعدة</h2>
          <ul className="flex flex-col gap-2.5 text-sm text-ink-muted">
            {help.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-ink-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold text-primary">تواصل معنا</h2>
          <ul className="flex flex-col gap-3 text-sm text-ink-muted">
            <li className="flex items-center gap-2.5">
              <Phone size={16} className="shrink-0 text-primary" aria-hidden />
              <a href={`tel:${site.phoneIntl}`} dir="ltr" className="num hover:text-ink-foreground">
                {site.phoneDisplay}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={16} className="shrink-0 text-primary" aria-hidden />
              <a href={`mailto:${site.email}`} className="hover:text-ink-foreground">
                {site.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin size={16} className="shrink-0 text-primary" aria-hidden />
              {site.address}
            </li>
          </ul>
          <h2 className="mb-3 mt-6 text-sm font-semibold text-primary">طرق الدفع</h2>
          <ul className="flex flex-wrap gap-2">
            {Object.values(paymentMethods).map((m) => (
              <li key={m.short} className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-ink-foreground">
                {m.short}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-ink-muted lg:px-6">
          © {new Date().getFullYear()} {site.name}. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}
