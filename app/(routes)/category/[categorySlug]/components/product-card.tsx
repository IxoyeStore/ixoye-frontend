/* eslint-disable @next/next/no-img-element */
import { ProductType } from "@/types/product";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "../../../../../components/ui/carousel";
import { Expand, ShoppingCart } from "lucide-react";
import IconButton from "@/components/ui/icon-button";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/formatPrice";

type ProductCardProps = {
  product: ProductType;
};

const ProductCard = ({ product }: ProductCardProps) => {
  const router = useRouter();
  return (
    <Link
      href={`/product/${product.slug}`}
      className="relative p-2 transition-all duration-200 rounded-lg hover:shadow-md"
    >
      <Carousel opts={{ align: "start" }} className="w-full max-w-sm">
        <CarouselContent>
          {product.images.map((image) => (
            <CarouselItem key={image.id}>
              <img
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${image.url}`}
                alt={product.productName}
                className="rounded-xl"
              />
              <div className="absolute w-full px-6 transition duration-200 opacity-0 group-gover:opacity-100 bottom-5">
                <div className="flex justify-center gap-x-6">
                  <IconButton
                    onClick={() => router.push(`/product/${product.slug}`)}
                    icon={<Expand size={20} className="text-gray-600" />}
                  />
                  <IconButton
                    onClick={() => console.log("product")}
                    icon={<ShoppingCart size={20} className="text-gray-600" />}
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <p className="text-2xl text-center">{product.productName}</p>
      <p className="font-bold text-center">${formatPrice(product.price)}</p>
    </Link>
  );
};

export default ProductCard;
