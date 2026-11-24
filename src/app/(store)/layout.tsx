import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { BottomNav } from "@/components/store/bottom-nav";
import { WhatsAppFloat } from "@/components/store/whatsapp-float";

export default function StoreLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
        تخطَّ إلى المحتوى
      </a>
      <Header />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer />
      <BottomNav />
      <WhatsAppFloat />
    </>
  );
}
