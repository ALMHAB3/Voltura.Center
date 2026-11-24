import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

type Props = {
  price: number;
  salePrice: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function Price({ price, salePrice, size = "md", className }: Props) {
  const discounted = salePrice < price;
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span
        className={cn(
          "num font-bold text-foreground",
          size === "sm" && "text-base",
          size === "md" && "text-lg",
          size === "lg" && "text-3xl",
        )}
      >
        {formatPrice(salePrice)}
      </span>
      {discounted && (
        <span className={cn("num text-muted line-through", size === "lg" ? "text-lg" : "text-xs")}>
          {formatPrice(price)}
        </span>
      )}
    </div>
  );
}
