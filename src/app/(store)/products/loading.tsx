import { ProductGridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-5 lg:px-6" aria-busy="true" aria-label="جارِ التحميل">
      <Skeleton className="mb-4 h-4 w-40" />
      <Skeleton className="mb-6 h-8 w-56" />
      <div className="flex gap-6">
        <Skeleton className="hidden h-[520px] w-64 shrink-0 lg:block" />
        <div className="flex-1">
          <Skeleton className="mb-4 h-14 w-full" />
          <ProductGridSkeleton count={12} />
        </div>
      </div>
    </div>
  );
}
