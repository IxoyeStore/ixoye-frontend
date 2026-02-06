/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";

interface ProductImageMiniatureProps {
  slug: string;
  url: string;
}

const ProductImageMiniature = (props: ProductImageMiniatureProps) => {
  const { slug, url } = props;
  const router = useRouter();

  return (
    <div
      className="cursor-pointer"
      onClick={() => router.push(`/product/${slug}`)}
    >
      <img
        src={url}
        alt="Producto"
        className="w-24 h-24 overflow-hidden rounded-md sm:w-auto sm:h-32"
      />
    </div>
  );
};

export default ProductImageMiniature;
