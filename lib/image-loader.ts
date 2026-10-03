"use client";

// Loader de next/image: evita que Vercel optimice imagenes (cuenta contra el
// limite de transformaciones del plan). Las de Cloudinary se optimizan en
// Cloudinary via URL; el resto (Railway, /public) se sirve tal cual.
type LoaderProps = { src: string; width: number; quality?: number };

const CLOUDINARY_UPLOAD = "res.cloudinary.com/";
const UPLOAD_SEGMENT = "/image/upload/";

export default function imageLoader({ src, width, quality }: LoaderProps) {
  if (src.includes(CLOUDINARY_UPLOAD) && src.includes(UPLOAD_SEGMENT)) {
    const transforms = `f_auto,q_${quality ?? "auto"},w_${width},c_limit`;
    return src.replace(UPLOAD_SEGMENT, `${UPLOAD_SEGMENT}${transforms}/`);
  }
  return src;
}
