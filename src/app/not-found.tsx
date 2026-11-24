import { SearchX } from "lucide-react";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { BottomNav } from "@/components/store/bottom-nav";
import { LinkButton } from "@/components/ui/button";
import { SearchBox } from "@/components/store/search-box";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-20 text-center">
        <span className="num text-7xl font-bold text-primary-strong">404</span>
        <SearchX size={40} className="text-muted" aria-hidden />
        <h1 className="text-2xl font-bold">الصفحة غير موجودة</h1>
        <p className="text-muted">ربما تغيّر الرابط أو لم يعد المنتج متوفراً. جرّب البحث:</p>
        <div className="w-full rounded-2xl bg-ink p-3">
          <SearchBox />
        </div>
        <div className="flex gap-2">
          <LinkButton href="/">الرئيسية</LinkButton>
          <LinkButton href="/products" variant="outline">
            كل المنتجات
          </LinkButton>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
