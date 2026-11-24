import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

export function Stars({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`التقييم ${value} من 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(value) ? "fill-warning text-warning" : "fill-transparent text-border"}
          aria-hidden
        />
      ))}
    </span>
  );
}
