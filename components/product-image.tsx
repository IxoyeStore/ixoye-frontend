/* eslint-disable @next/next/no-img-element */
import { PackageSearch } from "lucide-react";

interface ProductImageProps {
  url?: string;
  alt?: string;
  className?: string;
}

export function ProductImage({ url, alt, className = "" }: ProductImageProps) {
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;

  if (!url) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 text-slate-400 rounded-xl ${className}`}
      >
        <PackageSearch
          size={32}
          strokeWidth={1}
          className="text-[#0055a4] opacity-40"
        />
        <span className="text-[8px] font-black uppercase mt-1 tracking-tighter">
          Sin Imagen
        </span>
      </div>
    );
  }

  return (
    <img
      src={`${strapiUrl}${url}`}
      alt={alt || "Producto Ixoye"}
      className={`object-cover rounded-xl ${className}`}
    />
  );
}
