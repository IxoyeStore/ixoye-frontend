import Image from "next/image";
import { PackageSearch } from "lucide-react";
import { useState } from "react";

interface ProductImageProps {
  url?: string;
  alt?: string;
  className?: string;
}

export function ProductImage({ url, alt, className = "" }: ProductImageProps) {
  const [currentUrl, setCurrentUrl] = useState(url);
  const [hasError, setHasError] = useState(false);

  if (url !== currentUrl) {
    setCurrentUrl(url);
    setHasError(false);
  }

  if (!url || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 rounded-xl ${className}`}
      >
        <PackageSearch
          size={32}
          strokeWidth={1}
          className="text-[#0055a4] dark:text-sky-400 opacity-40"
        />
        <span className="text-[8px] font-black uppercase mt-1 tracking-tighter">
          Sin Imagen
        </span>
      </div>
    );
  }

  // object-cover recorta la imagen para llenar el contenedor; object-contain
  // la muestra completa. Antes el fit venia hardcodeado a cover sin importar
  // lo que el caller pidiera en className, por eso algunas miniaturas se
  // veian recortadas. Ahora se respeta object-cover si el caller lo pide
  // explicitamente, y por default se usa contain para no cortar el producto.
  const fit = className.includes("object-cover") ? "object-cover" : "object-contain";

  // Las fotos de producto vienen sobre fondo blanco; con object-contain
  // puede quedar espacio vacio alrededor de la imagen (letterboxing) si la
  // proporcion no coincide con el contenedor. Ese espacio debe ser blanco
  // puro (no adaptable a modo oscuro) para que se mimetice con el fondo
  // real de la foto en vez de mostrar un recuadro oscuro detras.
  return (
    <div
      className={`relative overflow-hidden rounded-xl select-none bg-white ${className}`}
    >
      <Image
        src={url}
        alt={alt || "Producto Ixoye"}
        fill
        draggable={false}
        className={fit}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={() => setHasError(true)}
      />
      <div className="absolute inset-0" />
    </div>
  );
}
