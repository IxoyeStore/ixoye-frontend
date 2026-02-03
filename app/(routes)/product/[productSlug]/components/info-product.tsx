"use client";

import { ProductType } from "@/types/product";
import { Separator } from "../../../../../components/ui/separator";
import { formatPrice } from "@/lib/formatPrice";
import { Button } from "../../../../../components/ui/button";
import { Heart, Tag, Truck, Settings, Hash, Layers, Box } from "lucide-react"; // Añadimos Box y Layers
import { useCart } from "@/hooks/use-cart";
import { useLovedProducts } from "@/hooks/use-loved-products";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

export type InfoProductProps = {
  product: ProductType;
};

const InfoProduct = (props: InfoProductProps) => {
  const { product } = props;
  const { user } = useAuth();
  const { items, addItem } = useCart();
  const { addLovedItem } = useLovedProducts();
  const isB2B = user?.profile?.type === "b2b";

  const finalPrice =
    isB2B && product.wholesalePrice ? product.wholesalePrice : product.price;
  const stock = Number(product.stock) ?? 0;
  const itemInCart = items.find((item) => item.id === product.id);
  const quantityInCart = itemInCart ? itemInCart.quantity || 1 : 0;

  const onAddToCart = () => {
    if (quantityInCart >= stock) {
      toast.error("Límite de stock alcanzado", {
        description:
          "No puedes agregar más unidades de las que hay disponibles.",
      });
      return;
    }
    addItem(product);
  };

  return (
    <div className="px-6 w-full max-w-full overflow-hidden">
      <div className="mb-3">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-[11px] font-bold bg-blue-50 text-[#0055a4] px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wider">
            {product.code}
          </span>
          {product.productType && (
            <span className="text-[11px] font-bold bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200 uppercase tracking-wider">
              {product.productType}
            </span>
          )}
        </div>

        <h1 className="text-3xl font-black text-[#001e36] leading-tight uppercase break-words">
          {product.productName}
        </h1>
      </div>

      <Separator className="my-4" />

      {/* Disponibilidad */}
      <div className="my-4 min-h-[30px]">
        {stock > 5 && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100">
            <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
            <p className="text-xs font-bold text-green-700 uppercase">
              Stock Disponible
            </p>
          </div>
        )}

        {stock > 0 && stock <= 5 && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100">
            <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            <p className="text-xs font-bold text-orange-600 uppercase">
              Quedan {stock} disponibles
            </p>
          </div>
        )}

        {stock <= 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <p className="text-xs font-bold text-red-600 uppercase">Agotado</p>
          </div>
        )}
      </div>

      {/* Información Técnica */}
      <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-200 my-6 shadow-sm overflow-hidden">
        <div className="space-y-2 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#0055a4]/10 text-[#0055a4]">
            <Truck size={12} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[0.15em]">
              Marca
            </span>
          </div>
          <p className="text-base font-extrabold text-[#001e36] px-1 uppercase truncate">
            {product.brand || "Genérico"}
          </p>
        </div>

        <div className="space-y-2 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#0055a4]/10 text-[#0055a4]">
            <Settings size={12} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[0.15em]">
              Serie
            </span>
          </div>
          <p className="text-base font-extrabold text-[#001e36] px-1 uppercase break-words leading-tight">
            {product.series || "N/A"}
          </p>
        </div>

        {/* Clasificación de Catálogo (Departamento y SubDepartamento) */}
        <div className="col-span-2 pt-4 border-t border-slate-200 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-200/50 text-slate-500">
            <Layers size={12} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[0.15em]">
              Series
            </span>
          </div>
          <p className="text-xs font-bold text-slate-500 px-1 uppercase tracking-tight">
            {product.department}{" "}
            {product.subDepartment && `> ${product.subDepartment}`}
          </p>
        </div>

        {/* OEM Code */}
        <div className="col-span-2 pt-4 border-t border-slate-200 space-y-3 w-full">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#0055a4]/10 text-[#0055a4]">
            <Tag size={12} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[0.15em]">
              Números OEM
            </span>
          </div>
          <div className="flex flex-wrap gap-2 px-1 w-full">
            {product.oemCode ? (
              product.oemCode.split(",").map((code, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-lg text-sm font-mono font-black bg-white border-2 border-[#0055a4]/20 text-[#0055a4] shadow-sm hover:border-[#0055a4] transition-all"
                >
                  {code.trim()}
                </span>
              ))
            ) : (
              <span className="text-slate-400 font-bold italic text-sm">
                Sin referencias...
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="prose prose-sm w-full">
        <p className="whitespace-pre-line text-slate-600 text-sm leading-relaxed mb-6 italic break-words">
          {product.description || "Sin descripción adicional."}
        </p>
      </div>

      <Separator className="my-4" />

      {/* Sección de Precio */}
      <div
        className={`my-6 p-5 rounded-2xl border transition-all duration-300 ${
          isB2B
            ? "bg-blue-50/50 border-blue-200 shadow-sm"
            : "bg-green-50/50 border-green-100"
        }`}
      >
        <div className="flex flex-col gap-2 w-full overflow-hidden">
          <div className="flex flex-col min-w-0">
            {isB2B && product.wholesalePrice && (
              <p className="text-sm text-slate-400 line-through decoration-red-400/50 mb-1">
                {formatPrice(product.price)}
              </p>
            )}
            <div className="flex flex-col items-start gap-2">
              <p className="text-3xl sm:text-4xl font-black text-green-700 tracking-tighter leading-none break-all sm:break-normal">
                {formatPrice(finalPrice)}
              </p>
              {isB2B && product.wholesalePrice && (
                <div className="inline-flex items-center gap-1 bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                  <Tag size={12} fill="white" className="shrink-0" />
                  <span className="whitespace-nowrap">Precio Preferencial</span>
                </div>
              )}
            </div>
          </div>
          <p
            className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${
              isB2B ? "text-blue-600/60" : "text-green-600/70"
            }`}
          >
            IVA Incluido / Precio Neto
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
        <Button
          className={`w-full sm:flex-[3] py-8 text-lg font-black uppercase tracking-widest shadow-[0_10px_20px_-10px_rgba(0,85,164,0.5)] transition-all active:scale-[0.95] ${
            stock > 0 && quantityInCart < stock
              ? "bg-[#0055a4] hover:bg-[#003d7a] text-white"
              : "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none"
          }`}
          onClick={onAddToCart}
          disabled={stock <= 0 || quantityInCart >= stock}
        >
          {stock <= 0
            ? "Sin Existencias"
            : quantityInCart >= stock
              ? "No disponible"
              : "Añadir al carrito"}
        </Button>

        <button
          onClick={() => addLovedItem(product)}
          className="w-full sm:flex-1 p-5 rounded-xl border-2 border-slate-100 text-[#0055a4] hover:bg-red-50 hover:border-red-100 hover:text-red-500 transition-all active:scale-90 shadow-sm flex justify-center items-center"
        >
          <Heart className="w-7 h-7" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default InfoProduct;
