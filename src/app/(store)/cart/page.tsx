import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata: Metadata = { title: "سلة التسوق", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-5 lg:px-6">
      <Breadcrumbs items={[{ label: "سلة التسوق" }]} />
      <h1 className="mb-5 text-2xl font-bold sm:text-3xl">سلة التسوق</h1>
      <CartView />
    </div>
  );
}
