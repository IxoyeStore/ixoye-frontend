import { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import CategoryPageClient from "./category-client";

const API = process.env.NEXT_PUBLIC_API_URL;

async function fetchCategory(slug: string) {
  try {
    const res = await fetch(
      `${API}/api/categories?filters[slug][$eq]=${slug}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await fetchCategory(categorySlug);

  if (!category) {
    return { title: "Categoría no encontrada | Ixoye" };
  }

  const name = category.categoryName as string;
  const title = `${name} para Camión, Tractor y Maquinaria Pesada | Refacciones Ixoye`;
  const description = `Compra ${name.toLowerCase()} para camión, tractor, agrícola y maquinaria pesada en Nayarit. Refacciones diésel originales y compatibles, envío rápido. Refacciones Ixoye.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/category/${categorySlug}` },
    openGraph: { title, description, type: "website" },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  const category = await fetchCategory(categorySlug);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Tienda", item: `${SITE_URL}/category` },
      ...(category
        ? [{
            "@type": "ListItem",
            position: 3,
            name: category.categoryName,
            item: `${SITE_URL}/category/${categorySlug}`,
          }]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CategoryPageClient />
    </>
  );
}
