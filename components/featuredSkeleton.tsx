import { Skeleton } from "./ui/skeleton";
import { CarouselItem } from "./ui/carousel";

type FeaturedSkeletonProps = {
  items?: number;
};

const FeaturedSkeleton = ({ items = 4 }: FeaturedSkeletonProps) => {
  return (
    <>
      {Array.from({ length: items }).map((_, index) => (
        <CarouselItem
          key={index}
          className="basis-1/2 md:basis-1/3 lg:basis-1/4 pl-2 md:pl-4 group"
        >
          <div className="h-full">
            <div className="flex h-full flex-col py-3 sm:py-4 border border-sky-100 dark:border-slate-700 shadow-sm rounded-2xl bg-white dark:bg-slate-800">
              {/* Image area */}
              <div className="relative flex items-center justify-center px-2 sm:px-6 py-2">
                <div className="w-full aspect-square overflow-hidden rounded-lg">
                  <Skeleton className="w-full h-full" />
                </div>
              </div>

              {/* Name + price */}
              <div className="mt-auto flex flex-col gap-2 px-3 sm:px-8 pb-2">
                <Skeleton className="h-3.5 w-4/5 rounded" />
                <Skeleton className="h-3.5 w-3/5 rounded" />
                <Skeleton className="h-4 w-1/3 rounded mt-1" />
              </div>
            </div>
          </div>
        </CarouselItem>
      ))}
    </>
  );
};

export default FeaturedSkeleton;
