/* eslint-disable @next/next/no-img-element */
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductImage } from "@/components/product-image";

interface CarouselProductProps {
  images: string[];
}

const CarouselProduct = ({ images }: CarouselProductProps) => {
  if (!images || images.length === 0) {
    return (
      <div className="sm:px-16">
        <ProductImage className="aspect-square w-full" />
      </div>
    );
  }

  const showArrows = images.length > 1;

  return (
    <div className="px-4 sm:px-16 w-full max-w-[400px] sm:max-w-full mx-auto">
      <Carousel
        opts={{
          loop: images.length > 1,
        }}
        className="w-full"
      >
        <CarouselContent>
          {images.map((imageUrl, index) => (
            <CarouselItem key={index}>
              <div className="aspect-square w-full relative overflow-hidden rounded-xl border border-slate-100 bg-white">
                <ProductImage
                  url={imageUrl}
                  alt={`Imagen del producto ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {showArrows && (
          <>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </>
        )}
      </Carousel>
    </div>
  );
};

export default CarouselProduct;
