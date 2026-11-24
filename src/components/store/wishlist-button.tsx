"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleWishlist } from "@/app/actions/wishlist";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/cn";

export function WishlistButton({
  productId,
  initial = false,
  className,
  withLabel = false,
}: {
  productId: number;
  initial?: boolean;
  className?: string;
  withLabel?: boolean;
}) {
  const [saved, setSaved] = useState(initial);
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
      onClick={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await toggleWishlist(productId);
          if (res.status === "signin") {
            toast("سجّل دخولك لحفظ المنتجات في المفضلة", "danger");
            router.push(`/account/login?next=${encodeURIComponent(window.location.pathname)}`);
            return;
          }
          setSaved(res.status === "added");
          toast(res.status === "added" ? "تمت الإضافة إلى المفضلة" : "تمت الإزالة من المفضلة");
        });
      }}
      className={cn("flex items-center justify-center gap-2 transition-colors", className)}
    >
      <Heart size={18} className={saved ? "fill-sale text-sale" : ""} aria-hidden />
      {withLabel && <span>{saved ? "في المفضلة" : "أضف للمفضلة"}</span>}
    </button>
  );
}
