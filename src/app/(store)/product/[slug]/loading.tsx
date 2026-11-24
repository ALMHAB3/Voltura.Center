import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-5 lg:px-6" aria-busy="true" aria-label="جارِ التحميل">
      <Skeleton className="mb-4 h-4 w-64" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <Skeleton className="aspect-square w-full rounded-3xl" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-4/5" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-44" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-13" />
            <Skeleton className="h-13" />
          </div>
          <Skeleton className="h-11" />
        </div>
      </div>
    </div>
  );
}
