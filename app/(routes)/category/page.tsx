import { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import CategoryListClient from "./category-list-client";

export const metadata: Metadata = {
  title: "Refacciones para Camión, Tractor y Maquinaria Pesada | Refacciones Ixoye",
  description:
    "Catálogo completo de refacciones diésel y agrícolas: filtros, frenos, motores y más para camión, tractor y maquinaria pesada. Envío rápido en Nayarit.",
  alternates: { canonical: `${SITE_URL}/category` },
  openGraph: {
    title: "Refacciones para Camión, Tractor y Maquinaria Pesada | Refacciones Ixoye",
    description:
      "Catálogo completo de refacciones diésel y agrícolas: filtros, frenos, motores y más para camión, tractor y maquinaria pesada.",
    type: "website",
  },
};

export default function Page() {
  return <CategoryListClient />;
}
