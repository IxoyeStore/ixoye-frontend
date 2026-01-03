import { Skeleton } from "@/components/ui/skeleton";

const SkeletonProduct = () => {
  return (
    <div className="flex justify-center mt-30">
      <div className="flex items-start space-x-4">
        <Skeleton className="h-[200px] w-[250px] rounded-xl" />
        <div className="flex flex-col space-y-10 m-5">
          <Skeleton className="h-6 w-[300px]" />
          <Skeleton className="h-12 w-[300px]" />
          <Skeleton className="h-6 w-[300px]" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonProduct;
