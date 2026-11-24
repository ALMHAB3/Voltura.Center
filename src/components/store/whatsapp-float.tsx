import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { whatsappLink } from "@/lib/whatsapp";

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink("مرحباً، عندي استفسار عن منتج")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا على واتساب"
      className="fixed bottom-20 end-4 z-30 flex size-13 animate-pulse-ring items-center justify-center rounded-full bg-[#25d366] text-white shadow-pop sm:bottom-6 sm:end-6"
    >
      <WhatsAppIcon size={28} />
    </a>
  );
}
