import { ProductGridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 pt-6 lg:px-6" aria-busy="true" aria-label="جارِ التحميل">
      <Skeleton className="aspect-[16/10] w-full rounded-3xl sm:aspect-[5/2]" />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-9">
        {Array.from({ length: 9 }, (_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <ProductGridSkeleton />
    </div>
  );
}
