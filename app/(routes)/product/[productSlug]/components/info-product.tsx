"use client";

import { ProductType } from "@/types/product";
import { Separator } from "../../../../../components/ui/separator";
import { formatPrice } from "@/lib/formatPrice";
import { Button } from "../../../../../components/ui/button";
import { Heart, Tag, Truck, Settings, Layers, Box, Hash } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useLovedProducts } from "@/hooks/use-loved-products";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export type InfoProductProps = {
  product: ProductType;
};

const InfoProduct = (props: InfoProductProps) => {
  const { product } = props;
  const { user } = useAuth();
  const router = useRouter();
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
      toast.error("Límite de stock alcanzado");
      return;
    }
    addItem(product);
  };

  const onBuyNow = () => {
    if (stock <= 0) return;
    if (quantityInCart < stock) addItem(product);
    router.push("/cart");
  };

  return (
    <div className="px-6 w-full max-w-full overflow-hidden flex flex-col">
      {/* Título del Producto*/}
      <div className="mb-4">
        <h1 className="text-3xl sm:text-4xl font-black text-[#001e36] leading-tight uppercase break-words tracking-tight">
          {product.productName}
        </h1>
      </div>

      <Separator className="my-2" />

      {/* Stock */}
      <div className="my-4">
        {stock > 0 ? (
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${stock <= 5 ? "bg-orange-50 border-orange-100 text-orange-600" : "bg-green-50 border-green-100 text-green-700"}`}
          >
            <div
              className={`h-2 w-2 rounded-full animate-pulse ${stock <= 5 ? "bg-orange-500" : "bg-green-600"}`}
            />
            <p className="text-[10px] font-black uppercase tracking-wider">
              {stock <= 5
                ? `Últimas ${stock} unidades`
                : "Existencia Disponible"}
            </p>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <p className="text-[10px] font-black uppercase tracking-wider">
              Agotado temporalmente
            </p>
          </div>
        )}
      </div>

      {/* Tarjeta de Información Técnica */}
      <div className="bg-white border border-slate-200 rounded-xl my-4 overflow-hidden shadow-sm">
        {/* Encabezado: */}
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Hash size={16} className="text-[#0055a4]" strokeWidth={3} />
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
              Código de Parte
            </span>
          </div>
          <span className="text-lg font-mono font-black text-[#001e36] tracking-tighter">
            {product.code}
          </span>
        </div>

        {/* Cuerpo de la tarjeta*/}
        <div className="p-5 flex flex-col gap-4">
          {/* Marca */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 border-b border-slate-50 pb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider min-w-[100px]">
              Marca
            </span>
            <p className="text-sm font-black text-slate-700 uppercase leading-snug">
              {product.brand || "Estandarizado"}
            </p>
          </div>

          {/* Tipo de Producto */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 border-b border-slate-50 pb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider min-w-[100px]">
              Tipo
            </span>
            <p className="text-sm font-black text-slate-700 uppercase leading-snug">
              {product.productType || "—"}
            </p>
          </div>

          {/* Serie / Modelo */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 border-b border-slate-50 pb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider min-w-[100px]">
              Serie
            </span>
            <p className="text-sm font-black text-slate-700 uppercase leading-snug italic">
              {product.series || "N/A"}
            </p>
          </div>

          {/* Línea de Aplicación */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Línea de Aplicación
            </span>
            <p className="text-sm font-black text-slate-700 uppercase leading-relaxed">
              {product.department}
              {product.subDepartment && (
                <span className="text-slate-400 font-medium">
                  {" "}
                  / {product.subDepartment}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Descripción Detallada */}
      <div className="mt-4 mb-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
          Descripción detallada
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed italic whitespace-pre-line">
          {product.description || "Sin descripción adicional disponible."}
        </p>
      </div>

      <Separator className="my-2" />

      {/* Sección de Precio */}
      <div
        className={`my-6 p-5 rounded-2xl border-2 transition-all ${isB2B ? "bg-blue-50/50 border-blue-100" : "bg-green-50/50 border-green-100"}`}
      >
        <div className="flex flex-col gap-1">
          {isB2B && product.wholesalePrice && (
            <p className="text-sm text-slate-400 line-through decoration-red-400/50">
              {formatPrice(product.price)}
            </p>
          )}
          <div className="flex flex-col items-start gap-1">
            <p
              className={`text-4xl sm:text-5xl font-black tracking-tighter ${isB2B ? "text-blue-700" : "text-green-700"}`}
            >
              {formatPrice(finalPrice)}
            </p>
            {product.freeShipping && (
              <div className="flex items-center gap-1.5 text-green-600 bg-white px-2 py-0.5 rounded-md border border-green-200 mt-1 shadow-sm">
                <Truck size={14} strokeWidth={3} />
                <span className="text-[11px] font-black uppercase tracking-wide">
                  Envío gratis Nayarit
                </span>
              </div>
            )}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-60">
            IVA Incluido / Precio Neto de Venta
          </p>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-col gap-3 mt-auto mb-8 flex-shrink-0">
        <div className="flex flex-row gap-3">
          <Button
            className="flex-[4] py-8 text-lg font-black uppercase tracking-widest bg-[#0055a4] hover:bg-[#003d7a] text-white shadow-xl transition-all active:scale-[0.95]"
            onClick={onBuyNow}
            disabled={stock <= 0}
          >
            Comprar Ahora
          </Button>
          <button
            onClick={() => addLovedItem(product)}
            className="flex-1 p-4 rounded-xl border-2 border-slate-200 text-[#0055a4] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-90 flex justify-center items-center shadow-sm"
          >
            <Heart className="w-8 h-8" strokeWidth={2.5} />
          </button>
        </div>
        <Button
          variant="outline"
          className={`w-full py-7 text-base font-black uppercase tracking-widest border-2 transition-all active:scale-[0.95] ${
            stock > 0 && quantityInCart < stock
              ? "border-[#0055a4] text-[#0055a4] hover:bg-blue-50 shadow-sm"
              : "border-slate-200 text-slate-300 cursor-not-allowed"
          }`}
          onClick={onAddToCart}
          disabled={stock <= 0 || quantityInCart >= stock}
        >
          {stock <= 0 ? "Sin Existencias" : "Añadir al carrito"}
        </Button>
      </div>
    </div>
  );
};

export default InfoProduct;
