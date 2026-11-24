import Link from "next/link";
import { ChevronDown, Flame, Heart, ShoppingCart, User } from "lucide-react";
import { getCategoryTree } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "./logo";
import { SearchBox } from "./search-box";
import { ThemeToggle } from "./theme-toggle";
import { CartCount } from "./cart-count";
import { MobileDrawer } from "./mobile-drawer";
import { CategoryIcon } from "./category-icon";

const iconButton =
  "relative flex size-10 items-center justify-center rounded-xl text-ink-foreground transition-colors hover:bg-white/10";

export async function Header() {
  const [tree, current] = await Promise.all([getCategoryTree(), getCurrentUser()]);

  return (
    <header className="sticky top-0 z-40 bg-ink-gradient text-ink-foreground shadow-[0_1px_0_rgb(255_255_255/0.06)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:h-[72px] sm:gap-5 lg:px-6">
        <MobileDrawer tree={tree} isSignedIn={Boolean(current)} isAdmin={Boolean(current?.isAdmin)} />
        <Logo />
        <SearchBox className="hidden flex-1 md:block md:max-w-xl lg:max-w-2xl" />
        <nav className="ms-auto flex items-center gap-1" aria-label="أدوات">
          <ThemeToggle className={iconButton} />
          <Link href="/wishlist" className={`${iconButton} hidden sm:flex`} aria-label="المفضلة">
            <Heart size={20} aria-hidden />
          </Link>
          <Link
            href={current ? "/account" : "/account/login"}
            className={`${iconButton} hidden sm:flex`}
            aria-label={current ? "حسابي" : "تسجيل الدخول"}
          >
            <User size={20} aria-hidden />
          </Link>
          <Link
            href="/cart"
            className="relative flex h-10 items-center gap-2 rounded-xl bg-primary px-3 font-semibold text-primary-foreground transition-colors hover:bg-primary-hover sm:px-4"
            aria-label="السلة"
          >
            <ShoppingCart size={20} aria-hidden />
            <span className="hidden text-sm sm:inline">السلة</span>
            <CartCount />
          </Link>
        </nav>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <SearchBox />
      </div>

      {/* Desktop category bar with mega menu */}
      <div className="hidden border-t border-white/10 lg:block">
        <nav className="mx-auto flex max-w-7xl items-center gap-1 px-6" aria-label="الأقسام">
          <div className="group relative">
            <button
              type="button"
              className="flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-ink-foreground hover:bg-white/10"
              aria-haspopup="true"
            >
              كل الأقسام
              <ChevronDown size={16} className="transition-transform group-focus-within:rotate-180 group-hover:rotate-180" aria-hidden />
            </button>
            <div className="invisible absolute start-0 top-full z-50 w-[min(880px,90vw)] pt-1 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-surface p-4 text-foreground shadow-pop">
                {tree.map((cat) => (
                  <div key={cat.id} className="rounded-xl p-3 hover:bg-surface-2">
                    <Link href={`/category/${cat.slug}`} className="flex items-center gap-2.5 font-semibold hover:text-primary-strong">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-surface-2 text-primary-strong">
                        <CategoryIcon name={cat.icon} size={18} />
                      </span>
                      {cat.name}
                    </Link>
                    {cat.children.length > 0 && (
                      <ul className="mt-2 flex flex-col gap-1 ps-11">
                        {cat.children.map((child) => (
                          <li key={child.id}>
                            <Link href={`/category/${child.slug}`} className="text-sm text-muted hover:text-primary-strong">
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {tree.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="flex h-11 items-center rounded-lg px-3 text-sm text-ink-muted transition-colors hover:bg-white/10 hover:text-ink-foreground"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            href="/offers"
            className="ms-auto flex h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-primary hover:bg-white/10"
          >
            <Flame size={16} aria-hidden />
            العروض
          </Link>
          <Link href="/track" className="flex h-11 items-center rounded-lg px-3 text-sm text-ink-muted hover:bg-white/10 hover:text-ink-foreground">
            تتبع طلبك
          </Link>
        </nav>
      </div>
    </header>
  );
}
