/* eslint-disable @next/next/no-img-element */
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface CarouselProductProps {
  images: string[];
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
          {images.map((imageUrl, index) => (
            // Usamos el index como key ya que ahora no tenemos un id de Strapi
            <CarouselItem key={index}>
              <img
                src={imageUrl}
                alt="Imagen del producto"
                className="rounded-lg w-full h-auto object-cover"
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
