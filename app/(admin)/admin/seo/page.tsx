"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search, CheckCircle2, XCircle, ExternalLink, Eye, ShoppingCart,
  TrendingUp, FolderX, FileText, Hash,
} from "lucide-react";

type SeoData = {
  content: {
    totalActive: number;
    withoutCategory: number;
    withoutDescription: number;
    withoutOemCode: number;
  };
  visibility: {
    trackedProducts: number;
    foundInSearchCount: number;
    neverFoundInSearch: number;
    totals: {
      views: number;
      cartAdds: number;
      purchases: number;
      searchImpressions: number;
      categoryImpressions: number;
    };
    topSearched: { productId: number; productName: string; searchImpressions: number }[];
  };
  technical: {
    sitemap: { ok: boolean; count: number | null };
    robots: { ok: boolean; count: number | null };
    feed: { ok: boolean; count: number | null };
  };
};

function pct(part: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

function ContentStat({
  icon: Icon, label, value, total, href,
}: { icon: any; label: string; value: number; total: number; href?: string }) {
  const percentage = pct(value, total);
  const severity = value / Math.max(total, 1) > 0.3 ? "text-red-600 dark:text-red-400" : value > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400";
  const Wrapper = href ? Link : ("div" as any);
  return (
    <Wrapper
      {...(href ? { href } : {})}
      className={`bg-white dark:bg-slate-800 rounded-2xl p-5 md:p-6 border border-slate-100 dark:border-slate-700 flex flex-col ${href ? "hover:border-sky-200 dark:hover:border-sky-700 hover:shadow-lg transition-all" : ""}`}
    >
      <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
        <Icon className="text-slate-400 dark:text-slate-500" size={18} />
      </div>
      <div className="mt-auto pt-5">
        <p className={`text-2xl md:text-3xl font-black tracking-tighter ${severity}`}>
          {value} <span className="text-base font-bold text-slate-300 dark:text-slate-600">({percentage})</span>
        </p>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-0.5">
          {label}
        </p>
      </div>
    </Wrapper>
  );
}

function TechRow({ label, ok, count, countLabel, href }: { label: string; ok: boolean; count: number | null; countLabel?: string; href: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {ok ? (
          <CheckCircle2 size={18} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
        ) : (
          <XCircle size={18} className="text-red-500 dark:text-red-400 shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</p>
          {count !== null && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{count} {countLabel}</p>
          )}
        </div>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 transition-colors"
      >
        Ver <ExternalLink size={12} />
      </a>
    </div>
  );
}

export default function AdminSeoPage() {
  const [data, setData] = useState<SeoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/seo")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-6 px-4 sm:py-8 sm:px-6 md:px-10 space-y-6 md:space-y-8 w-full md:w-[85%] mx-auto">

      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white italic">
          SEO
        </h1>
        <p className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-widest">
          Salud de contenido y visibilidad en buscadores
        </p>
      </div>

      {loading || !data ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 md:p-6 border border-slate-100 dark:border-slate-700 h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Estado tecnico */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            <div className="px-5 md:px-6 py-4 md:py-5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <Search size={15} className="text-slate-400 dark:text-slate-500" />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                Estado técnico
              </h2>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-700">
              <TechRow label="Sitemap" ok={data.technical.sitemap.ok} count={data.technical.sitemap.count} countLabel="URLs" href="/sitemap.xml" />
              <TechRow label="Robots.txt" ok={data.technical.robots.ok} count={null} href="/robots.txt" />
              <TechRow label="Feed de Google Shopping" ok={data.technical.feed.ok} count={data.technical.feed.count} countLabel="productos" href="/feed/google-shopping.xml" />
            </div>
          </div>

          {/* Salud de contenido */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 px-1">
              Salud de contenido ({data.content.totalActive} productos activos)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
              <ContentStat icon={FolderX} label="Sin categoría" value={data.content.withoutCategory} total={data.content.totalActive} href="/admin/products?category=__uncategorized__" />
              <ContentStat icon={FileText} label="Sin descripción" value={data.content.withoutDescription} total={data.content.totalActive} />
              <ContentStat icon={Hash} label="Sin código OEM" value={data.content.withoutOemCode} total={data.content.totalActive} />
            </div>
          </div>

          {/* Visibilidad en busqueda */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 px-1">
              Visibilidad en búsqueda
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              <ContentStat icon={Search} label="Nunca aparecieron en una búsqueda" value={data.visibility.neverFoundInSearch} total={data.content.totalActive} />
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 md:p-6 border border-slate-100 dark:border-slate-700 flex flex-col">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center">
                  <Eye className="text-sky-600 dark:text-sky-400" size={18} />
                </div>
                <div className="mt-auto pt-5">
                  <p className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
                    {data.visibility.totals.views}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-0.5">
                    Vistas totales
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 md:p-6 border border-slate-100 dark:border-slate-700 flex flex-col">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
                  <ShoppingCart className="text-violet-600 dark:text-violet-400" size={18} />
                </div>
                <div className="mt-auto pt-5">
                  <p className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
                    {data.visibility.totals.cartAdds}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-0.5">
                    Agregados al carrito
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 md:p-6 border border-slate-100 dark:border-slate-700 flex flex-col">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                  <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={18} />
                </div>
                <div className="mt-auto pt-5">
                  <p className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
                    {data.visibility.totals.purchases}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-0.5">
                    Compras
                  </p>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 px-1 italic">
              Son totales acumulados desde que existe cada producto, no de un periodo — sirven para comparar productos entre sí, no para ver tendencia en el tiempo.
            </p>
          </div>

          {/* Top buscados */}
          {data.visibility.topSearched.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="px-5 md:px-6 py-4 md:py-5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                <TrendingUp size={15} className="text-emerald-500 dark:text-emerald-400" />
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                  Más encontrados en búsqueda
                </h2>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-slate-700">
                {data.visibility.topSearched.map((p, i) => (
                  <div key={p.productId} className="px-5 py-3.5 flex items-center gap-3">
                    <span className="text-xs font-black text-slate-300 dark:text-slate-600 w-4 shrink-0">{i + 1}</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate flex-1">
                      {p.productName}
                    </span>
                    <span className="shrink-0 text-[10px] font-black text-sky-600 dark:text-sky-400">
                      {p.searchImpressions} <span className="text-slate-300 dark:text-slate-600">búsquedas</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
