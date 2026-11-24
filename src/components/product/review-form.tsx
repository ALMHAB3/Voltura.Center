"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { submitReview } from "@/app/actions/reviews";
import { Button } from "@/components/ui/button";
import { FormMessage, Textarea } from "@/components/ui/form";
import { cn } from "@/lib/cn";

export function ReviewForm({ productId, slug }: { productId: number; slug: string }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => setResult(await submitReview({ productId, slug, rating, comment })));
      }}
    >
      <h3 className="font-bold">اكتب تقييمك</h3>
      <div className="flex gap-1" role="radiogroup" aria-label="التقييم">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" role="radio" aria-checked={rating === i} aria-label={`${i} من 5`} onClick={() => setRating(i)}>
            <Star size={28} className={cn(i <= rating ? "fill-warning text-warning" : "text-border")} aria-hidden />
          </button>
        ))}
      </div>
      <label htmlFor="review-comment" className="sr-only">
        تعليقك
      </label>
      <Textarea id="review-comment" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} placeholder="ما رأيك في المنتج؟ (اختياري)" />
      {result && <FormMessage tone={result.ok ? "success" : "danger"}>{result.message}</FormMessage>}
      <Button type="submit" variant="ink" disabled={pending || rating === 0} className="self-start">
        نشر التقييم
      </Button>
    </form>
  );
}
