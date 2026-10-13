import { Skeleton } from "@/components/ui/Skeleton";
import { LawyerCardSkeleton } from "@/components/lawyer/LawyerCard";

export default function Loading() {
  return (
    <div className="container py-10" role="status" aria-label="Loading lawyers">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-6 h-10 w-3/4 max-w-xl" />
      <Skeleton className="mt-4 h-5 w-2/3 max-w-lg" />
      <Skeleton className="mt-8 h-12 w-full rounded-full" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <LawyerCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
