import { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import CategoryListClient from "../category/category-list-client";

export const metadata: Metadata = {
  title: "Novedades | Refacciones Ixoye",
  description:
    "Descubre los productos más recientes agregados al catálogo de Refacciones Ixoye: filtros, frenos, motores y más para camión, tractor y maquinaria pesada.",
  alternates: { canonical: `${SITE_URL}/novedades` },
  openGraph: {
    title: "Novedades | Refacciones Ixoye",
    description:
      "Descubre los productos más recientes agregados al catálogo de Refacciones Ixoye.",
    type: "website",
  },
};

export default function Page() {
  return <CategoryListClient title="Novedades" />;
}
