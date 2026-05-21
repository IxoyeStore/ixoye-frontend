import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Hash } from "lucide-react";
import { ProductType } from "@/types/product";
import ProductGallery from "./components/product-gallery";
import InfoProduct from "./components/info-product";
import ProductDescription from "./components/product-description";

const API = process.env.NEXT_PUBLIC_API_URL;

async function fetchProduct(slug: string): Promise<ProductType | null> {
  try {
    const res = await fetch(
      `${API}/api/products?filters[slug][$eq]=${slug}&populate[category][fields][0]=categoryName&populate[category][fields][1]=slug`,
      { next: { revalidate: 60 } },
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
  params: Promise<{ productSlug: string }>;
}): Promise<Metadata> {
  const { productSlug } = await params;
  const product = await fetchProduct(productSlug);
  if (!product) return { title: "Producto no encontrado | Ixoye" };

  const desc = product.description
    ? product.description.slice(0, 155)
    : `${product.productName} — Código: ${product.code}. Marca: ${product.brand || "Estándar"}.`;

  return {
    title: `${product.productName} | Ixoye`,
    description: desc,
    openGraph: {
      title: product.productName,
      description: desc,
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
      type: "website",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  const { productSlug } = await params;
  const product = await fetchProduct(productSlug);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <p className="text-2xl font-black text-slate-300 uppercase tracking-widest">
          Producto no encontrado
        </p>
        <Link href="/" className="mt-6 text-sm font-bold text-sky-600 hover:underline">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  const images: string[] =
    Array.isArray(product.images) && product.images.length > 0 ? product.images : [];

  const seriesList = product.series
    ? product.series.split(",").map((s) => s.trim())
    : [];

  return (
    <div className="max-w-6xl py-6 mx-auto sm:py-12 sm:px-16 space-y-8">

      {/* ── Breadcrumb (desktop) ─────────────────────────────────────────── */}
      <nav className="hidden sm:flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider">
        <Link href="/" className="hover:text-slate-700 transition-colors">Inicio</Link>
        <ChevronRight size={15} className="text-slate-300 shrink-0" />
        <Link href="/category" className="hover:text-slate-700 transition-colors">Tienda</Link>
        <ChevronRight size={15} className="text-slate-300 shrink-0" />
        {product.category && (
          <>
            <Link href={`/category/${product.category.slug}`} className="hover:text-slate-700 transition-colors">
              {product.category.categoryName}
            </Link>
            <ChevronRight size={15} className="text-slate-300 shrink-0" />
          </>
        )}
        <span className="text-slate-600 truncate max-w-[280px]">{product.productName}</span>
      </nav>

      {/* ── Mobile back link ─────────────────────────────────────────────── */}
      <div className="sm:hidden flex items-center gap-1 px-3">
        <Link
          href={product.category ? `/category/${product.category.slug}` : "/category"}
          className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ChevronRight size={12} className="rotate-180" />
          {product.category ? product.category.categoryName : "Tienda"}
        </Link>
      </div>

      {/* ── Top grid: image | title + price + buttons ───────────────────── */}
      <div className="grid sm:grid-cols-2 gap-0 sm:gap-10 items-start overflow-visible">
        <div className="px-3 sm:px-0">
          <ProductGallery images={images} productName={product.productName} />
        </div>
        {/* pb-36 on mobile so sticky CTA bar doesn't cover content */}
        <div className="pb-36 sm:pb-0">
          <InfoProduct product={product} />
        </div>
      </div>

      {/* ── Bottom grid: description | tech info ─────────────────────────── */}
      <div className="grid sm:grid-cols-2 gap-6 sm:gap-10 items-start px-3 sm:px-0 pb-10 sm:pb-0">

        <ProductDescription text={product.description || "Sin descripción adicional disponible."} />

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Hash size={16} className="text-[#0055a4]" strokeWidth={3} />
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                Numero de Parte
              </span>
            </div>
            <span className="text-lg font-mono font-black text-[#001e36] tracking-tighter">
              {product.code}
            </span>
          </div>

          <div className="p-5 flex flex-col gap-4">
            <div className="flex justify-between items-baseline border-b border-slate-50 pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Marca</span>
              <p className="text-sm font-black text-slate-700 uppercase">{product.brand || "Estandarizado"}</p>
            </div>

            {product.oemCode && (
              <div className="flex justify-between items-baseline border-b border-slate-50 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">OEM</span>
                <p className="text-sm font-mono font-black text-slate-700 uppercase tracking-tight">{product.oemCode}</p>
              </div>
            )}

            <div className="flex justify-between items-baseline border-b border-slate-50 pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo</span>
              <p className="text-sm font-black text-slate-700 uppercase">{product.productType || "—"}</p>
            </div>

            <div className="flex justify-between items-baseline border-b border-slate-50 pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Línea</span>
              <p className="text-sm font-black text-slate-700 uppercase text-right">
                {product.department}
                {product.subDepartment && (
                  <span className="text-slate-400 font-medium"> / {product.subDepartment}</span>
                )}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Series Compatibles</span>
              <div className="flex flex-wrap gap-2">
                {seriesList.length > 0 ? (
                  seriesList.map((serie, idx) => (
                    <span
                      key={idx}
                      className="inline-flex whitespace-nowrap bg-slate-100 text-slate-700 text-[10px] font-black uppercase px-2 py-1 rounded-md border border-slate-200 italic shadow-sm"
                    >
                      {serie}
                    </span>
                  ))
                ) : (
                  <p className="text-sm font-black text-slate-300 uppercase">N/A</p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
