import Image from "next/image";
import { PackageSearch } from "lucide-react";

interface ProductImageProps {
  url?: string;
  alt?: string;
  className?: string;
}

export function ProductImage({ url, alt, className = "" }: ProductImageProps) {
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
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      <Image
        src={url}
        alt={alt || "Producto Ixoye"}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}
