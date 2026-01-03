/* eslint-disable @next/next/no-img-element */
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type ImageProps = {
  id: number;
  url: string;
  alternativeText?: string | null;
};

interface CarouselProductProps {
  images: ImageProps[];
}

const CarouselProduct = ({ images }: CarouselProductProps) => {
  if (!images || images.length === 0) {
    return <p>No hay imagenes para mostrar</p>;
  }

  const showArrows = images.length > 1;

  return (
    <div className="sm:px-16">
      <Carousel
        opts={{
          loop: images.length > 1,
        }}
      >
        <CarouselContent>
          {images.map((image) => (
            <CarouselItem key={image.id}>
              <img
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${image.url}`}
                alt={image.alternativeText ?? "Imagen del producto"}
                className="rounded-lg"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {showArrows && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
      </Carousel>
    </div>
  );
};

export default CarouselProduct;
