"use client";

import Link from "next/link";
import { buttonVariants } from "./ui/button";

const BannerDiscount = () => {
  return (
    <div className="p-5 sm:p-20 text-center bg-gradient-to-b from-white to-sky-50/50">
      <h2 className="uppercase font-black text-2xl text-[#003366]">
        Encuentra descuentos en toda la tienda
      </h2>

      <div className="max-w-md mx-auto flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-8 mt-5">
        <Link
          href="/category"
          className={buttonVariants({
            className:
              "w-full sm:w-auto bg-sky-700/90 hover:bg-sky-800 text-white border-none transition-colors",
          })}
        >
          Comprar
        </Link>
        <Link
          href="/info"
          className={buttonVariants({
            variant: "outline",
            className:
              "w-full sm:w-auto border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-800 transition-colors",
          })}
        >
          Más información
        </Link>
      </div>
    </div>
  );
};

export default BannerDiscount;
