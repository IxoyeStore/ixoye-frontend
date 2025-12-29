import { Skeleton } from "./ui/skeleton"
import { CarouselItem } from "./ui/carousel"

type FeaturedSkeletonProps = {
  items?: number
}

const FeaturedSkeleton = ({ items = 3 }: FeaturedSkeletonProps) => {
  return (
    <>
      {Array.from({ length: items }).map((_, index) => (
        <CarouselItem
          key={index}
          className="md:basis-1/2 lg:basis-1/3"
        >
          <div className="p-1 h-full">
            <div className="flex h-full flex-col py-4 border border-gray-200 rounded-lg">
              
              {/* Imagen */}
              <div className="relative flex items-center justify-center px-6 py-2">
                <div className="w-full max-w-[220px] aspect-square">
                  <Skeleton className="h-full w-full rounded-md" />
                </div>
              </div>

              {/* Texto + precio */}
              <div className="mt-auto flex justify-between gap-4 px-8 pt-4">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-14" />
              </div>

            </div>
          </div>
        </CarouselItem>
      ))}
    </>
  )
}

export default FeaturedSkeleton
