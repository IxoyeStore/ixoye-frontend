import React from "react";

export const Skeleton = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-300 dark:bg-gray-700 ${className}`}
    />
  );
};

interface SkeletonGridProps {
  grid?: number;
}

const SkeletonGrid: React.FC<SkeletonGridProps> = ({ grid = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {Array.from({ length: grid }).map((_, index) => (
        <div key={index} className="flex flex-col gap-4 mx-auto">
          <Skeleton className="h-[140px] w-full rounded-xl" />

          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonGrid;
