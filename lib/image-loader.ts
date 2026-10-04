"use client";

// Loader de next/image: evita que Vercel optimice imagenes (cuenta contra el
// limite de transformaciones del plan). Las de Cloudinary se optimizan en
// Cloudinary via URL; el resto (Railway, /public) se sirve tal cual.
type LoaderProps = { src: string; width: number; quality?: number };

const CLOUDINARY_UPLOAD = "res.cloudinary.com/";
const UPLOAD_SEGMENT = "/image/upload/";

// URL de Cloudinary con formato/calidad automaticos y ancho maximo. Para
// usar en <img> normales, que no pasan por el loader de next/image.
export function cloudinaryUrl(src: string, width: number, quality?: number) {
  if (src.includes(CLOUDINARY_UPLOAD) && src.includes(UPLOAD_SEGMENT)) {
    const transforms = `f_auto,q_${quality ?? "auto"},w_${width},c_limit`;
    return src.replace(UPLOAD_SEGMENT, `${UPLOAD_SEGMENT}${transforms}/`);
  }
  return src;
}

// srcSet para <img> normales; si la imagen no es de Cloudinary no aplica.
export function cloudinarySrcSet(src: string, widths: number[]) {
  if (cloudinaryUrl(src, widths[0]) === src) return undefined;
  return widths.map((w) => `${cloudinaryUrl(src, w)} ${w}w`).join(", ");
}

export default function imageLoader({ src, width, quality }: LoaderProps) {
  return cloudinaryUrl(src, width, quality);
}
