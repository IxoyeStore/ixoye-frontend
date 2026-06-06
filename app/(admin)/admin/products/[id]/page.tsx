"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "../_form";
import { Eye, ShoppingCart, TrendingUp, SearchIcon, LayoutList, ArrowRight, BarChart2 } from "lucide-react";

type Metrics = {
  searchImpressions: number;
  categoryImpressions: number;
  views: number;
  cartAdds: number;
  purchases: number;
};

function pct(num: number, den: number) {
  if (!den) return "—";
  return (num / den * 100).toFixed(1) + "%";
}

function FunnelStep({
  icon,
  label,
  value,
  color,
  showArrow,
  convRate,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  showArrow?: boolean;
  convRate?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center gap-1 min-w-[80px]">
        <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${color}`}>
          {icon}
        </div>
        <span className="text-xl font-black text-slate-800 dark:text-slate-100">{value.toLocaleString()}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center leading-tight">{label}</span>
      </div>
      {showArrow && (
        <div className="flex flex-col items-center gap-1 px-1">
          <ArrowRight size={16} className="text-slate-300" />
          {convRate && (
            <span className="text-[10px] font-black text-slate-400">{convRate}</span>
          )}
        </div>
      )}
    </div>
  );
}

function MetricsPanel({ productId }: { productId: number }) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/metrics")
      .then((r) => r.json())
      .then((map) => {
        const m = map[productId];
        setMetrics(
          m ?? { searchImpressions: 0, categoryImpressions: 0, views: 0, cartAdds: 0, purchases: 0 }
        );
      })
      .catch(() =>
        setMetrics({ searchImpressions: 0, categoryImpressions: 0, views: 0, cartAdds: 0, purchases: 0 })
      )
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading)
    return (
      <div className="mt-6 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 animate-pulse bg-white dark:bg-slate-800">
        <div className="h-4 w-40 bg-slate-100 dark:bg-slate-700 rounded mb-6" />
        <div className="flex gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 w-20 bg-slate-100 dark:bg-slate-700 rounded-xl" />
          ))}
        </div>
      </div>
    );

  if (!metrics) return null;

  const { searchImpressions, categoryImpressions, views, cartAdds, purchases } = metrics;
  const totalImpressions = searchImpressions + categoryImpressions;
  const abandonment = cartAdds > 0 ? ((cartAdds - purchases) / cartAdds * 100).toFixed(1) + "%" : "—";

  return (
    <div className="mt-6 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
        <BarChart2 size={16} className="text-sky-500" />
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">Métricas del Producto</h2>
      </div>

      <div className="p-6 space-y-8">

        {/* Funnel */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Embudo de conversión</p>
          <div className="flex flex-wrap items-center gap-1">
            <FunnelStep
              icon={<SearchIcon size={16} className="text-white" />}
              label="Búsqueda"
              value={searchImpressions}
              color="bg-violet-500"
              showArrow
              convRate={pct(categoryImpressions, searchImpressions)}
            />
            <FunnelStep
              icon={<LayoutList size={16} className="text-white" />}
              label="Categoría"
              value={categoryImpressions}
              color="bg-cyan-500"
              showArrow
              convRate={pct(views, totalImpressions)}
            />
            <FunnelStep
              icon={<Eye size={16} className="text-white" />}
              label="Vistas"
              value={views}
              color="bg-sky-500"
              showArrow
              convRate={pct(cartAdds, views)}
            />
            <FunnelStep
              icon={<ShoppingCart size={16} className="text-white" />}
              label="Carrito"
              value={cartAdds}
              color="bg-amber-500"
              showArrow
              convRate={pct(purchases, cartAdds)}
            />
            <FunnelStep
              icon={<TrendingUp size={16} className="text-white" />}
              label="Compras"
              value={purchases}
              color="bg-emerald-500"
            />
          </div>
        </div>

        {/* KPIs */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Tasas clave</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CTR Búsqueda</p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{pct(views, searchImpressions)}</p>
              <p className="text-[10px] text-slate-400 mt-1">vistas / búsquedas</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CTR Categoría</p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{pct(views, categoryImpressions)}</p>
              <p className="text-[10px] text-slate-400 mt-1">vistas / categoría</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Conv. Carrito</p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{pct(cartAdds, views)}</p>
              <p className="text-[10px] text-slate-400 mt-1">carrito / vistas</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Conv. Compra</p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{pct(purchases, views)}</p>
              <p className="text-[10px] text-slate-400 mt-1">compras / vistas</p>
            </div>
          </div>
        </div>

        {/* Abandonment */}
        <div className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-700 px-5 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Abandono de carrito</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Productos agregados al carrito que no se compraron</p>
          </div>
          <p className="text-3xl font-black text-amber-500">{abandonment}</p>
        </div>

      </div>
    </div>
  );
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [initialData, setInitialData] = useState<any>(null);
  const [productId, setProductId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/admin/products/${id}`);
      const json = await res.json();
      const p = json.data || json;
      setProductId(p.id ?? null);
      setInitialData({
        productName: p.productName || "",
        slug: p.slug || "",
        description: p.description || "",
        code: p.code || "",
        department: p.department || "",
        subDepartment: p.subDepartment || "",
        productType: p.productType || "",
        brand: p.brand || "",
        series: p.series || "",
        motors: p.motors || "",
        oemCode: p.oemCode || "",
        price: String(p.price || ""),
        wholesalePrice: p.wholesalePrice ? String(p.wholesalePrice) : "",
        stock: String(p.stock ?? ""),
        active: p.active ?? true,
        isFeatured: p.isFeatured ?? false,
        freeShipping: p.freeShipping ?? false,
        categoryId: p.category?.documentId || "",
        images: Array.isArray(p.images) ? p.images : [],
      });
      setLoading(false);
    })();
  }, [id]);

  if (loading) return (
    <div className="p-8 animate-pulse text-slate-400 text-[10px] font-black uppercase tracking-widest">Cargando producto...</div>
  );

  if (!initialData) return (
    <div className="p-8 text-red-500 text-[10px] font-black uppercase tracking-widest">Producto no encontrado</div>
  );

  return (
    <div>
      <ProductForm documentId={id} initialData={initialData} />
      {productId !== null && <MetricsPanel productId={productId} />}
    </div>
  );
}
