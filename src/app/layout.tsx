import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Readex_Pro } from "next/font/google";
import { site } from "@/lib/site";
import { getCurrentUser } from "@/lib/auth";
import { getServerCart } from "@/app/actions/cart";
import { CartProvider } from "@/components/store/cart-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const body = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const heading = Readex_Pro({
  subsets: ["arabic", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.nameAr} | ${site.name} — إلكترونيات في ليبيا`,
    template: `%s | ${site.nameAr}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    locale: "ar_LY",
    siteName: site.name,
    images: ["/brand/logo-original.jpg"],
  },
  alternates: {
    canonical: "/",
    languages: { ar: "/", "x-default": "/" },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0c1f2e" },
    { media: "(prefers-color-scheme: dark)", color: "#060f17" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Applies the saved theme before first paint to avoid a flash.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})()`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const current = await getCurrentUser();
  const serverCart = current ? await getServerCart() : [];

  return (
    <html lang="ar" dir="rtl" className={`${body.variable} ${heading.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh antialiased">
        <CartProvider isSignedIn={Boolean(current)} initialItems={serverCart}>
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
