import Link from "next/link";
import { buttonVariants } from "./ui/button";

const BannerProduct = () => {
  return (
    <>
      <div className="mt-4 text-center">
        <p>Refacciones Diesel y Agricola</p>
        <h4 className="mt-2 text5xl font-extrabold upperce">Ixoye</h4>
        <p className="my-2 text-lg">Explora nuestros productos</p>
        <Link href="/category" className={`${buttonVariants()} mb-3`}>
          Comprar
        </Link>
      </div>

      <div className="h-[230px] bg-cover lg:h-[600px] bg-[url('/slider-image.jpg')]"></div>
    </>
  );
};

export default BannerProduct;
