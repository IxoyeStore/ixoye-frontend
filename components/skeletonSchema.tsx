import { Skeleton } from "./ui/skeleton";

type SkeletonSchemaProps = {
  grid: number;
};

const SkeletonSchema = ({ grid }: SkeletonSchemaProps) => {
  return (
    <>
      {Array.from({ length: grid }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-4 p-4 border rounded-xl bg-background"
        >
          {/* Imagen */}
          <Skeleton className="w-full aspect-square rounded-lg" />

          {/* Texto */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </>
  );
};

export default SkeletonSchema;
