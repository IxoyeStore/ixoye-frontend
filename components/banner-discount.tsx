"use client";

import Link from "next/link";
import { buttonVariants } from "./ui/button";

const BannerDiscount = () => {
  return (
    <div className="p-5 sm:p-20 text-center">
      <h2 className="uppercase font-black text-2xl text-primary">
        Encuentra descuentos en toda la tienda
      </h2>
      <div className="max-w-md mx-auto sm:flex justify-center gap-8 mt-5">
        <Link href="/category" className={buttonVariants()}>
          Comprar
        </Link>
        <Link href="/info" className={buttonVariants({ variant: "outline" })}>
          Más información
        </Link>
      </div>
    </div>
  );
};

export default BannerDiscount;
