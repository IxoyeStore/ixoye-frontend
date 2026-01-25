"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Search, ChevronDown, Tractor, Settings } from "lucide-react";

const FIELD_MAP: Record<string, string> = {
  tractor: "series",
  motor: "series",
};

export default function TechnicalFilterModal({ isOpen, type, onClose }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingStep2, setLoadingStep2] = useState(false);
  const [selections, setSelections] = useState({ step1: "", step2: "" });
  const [options, setOptions] = useState<{ step1: string[]; step2: string[] }>({
    step1: [],
    step2: [],
  });

  useEffect(() => {
    if (!isOpen || !type || (type !== "tractor" && type !== "motor")) return;

    const fetchStep1 = async () => {
      setLoading(true);
      try {
        const field = FIELD_MAP[type];
        const categoryFilter = `&filters[category][categoryName][$containsi]=${type}`;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/products?filters[${field}][$notNull]=true${categoryFilter}&fields[0]=${field}&pagination[pageSize]=100`,
        );

        const json = await response.json();
        if (json.data) {
          const values = json.data.map(
            (item: any) => (item.attributes || item)[field],
          );
          const unique = Array.from(
            new Set(values.filter(Boolean)),
          ) as string[];
          setOptions({ step1: unique.sort(), step2: [] });
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };

    fetchStep1();
    setSelections({ step1: "", step2: "" });
  }, [isOpen, type]);

  useEffect(() => {
    if (!selections.step1 || !type) return;

    const fetchStep2 = async () => {
      setLoadingStep2(true);
      try {
        const field = FIELD_MAP[type];
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/products?filters[${field}][$eq]=${selections.step1}&fields[0]=productName&pagination[pageSize]=100`,
        );
        const json = await response.json();
        if (json.data) {
          const values = json.data.map(
            (item: any) => (item.attributes || item).productName,
          );
          setOptions((prev) => ({
            ...prev,
            step2: Array.from(new Set(values.filter(Boolean))) as string[],
          }));
        }
      } catch (e) {
        console.error(e);
      }
      setLoadingStep2(false);
    };

    fetchStep2();
  }, [selections.step1, type]);

  if (!isOpen || !type) return null;

  const handleSearch = () => {
    const val = selections.step2 || selections.step1;
    const param = selections.step2 ? "productName" : "series";
    router.push(`/category?${param}=${encodeURIComponent(val)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-sky-900/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-50 rounded-2xl text-sky-600">
              {type === "tractor" ? (
                <Tractor size={24} />
              ) : (
                <Settings size={24} />
              )}
            </div>
            <div>
              <h2 className="text-xl font-black text-sky-950 uppercase italic tracking-tighter leading-none">
                Buscador {type}
              </h2>
              <span className="text-[10px] text-sky-500 font-bold uppercase tracking-widest">
                Filtro jerárquico
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <label className="text-[10px] font-black text-sky-950 uppercase italic ml-4 mb-2 block tracking-widest">
              1. Selecciona la Serie
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-slate-50 border border-slate-100 p-5 rounded-3xl text-sm font-bold text-sky-950 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer uppercase italic disabled:opacity-50"
                value={selections.step1}
                onChange={(e) =>
                  setSelections({ step1: e.target.value, step2: "" })
                }
                disabled={loading}
              >
                <option value="">
                  {loading ? "Cargando..." : "-- Seleccionar --"}
                </option>
                {options.step1.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-5 top-1/2 -translate-y-1/2 text-sky-500 pointer-events-none"
                size={18}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-sky-950 uppercase italic ml-4 mb-2 block tracking-widest">
              2. Modelo de Refacción
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-slate-50 border border-slate-100 p-5 rounded-3xl text-sm font-bold text-sky-950 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer uppercase italic disabled:opacity-50"
                value={selections.step2}
                onChange={(e) =>
                  setSelections({ ...selections, step2: e.target.value })
                }
                disabled={!selections.step1 || loadingStep2}
              >
                <option value="">
                  {loadingStep2 ? "Cargando..." : "-- Todos los modelos --"}
                </option>
                {options.step2.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-5 top-1/2 -translate-y-1/2 text-sky-500 pointer-events-none"
                size={18}
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={!selections.step1}
            className="w-full mt-2 py-5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 text-white rounded-[2rem] font-black uppercase italic tracking-widest shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3"
          >
            <Search size={20} /> Ver Resultados
          </button>
        </div>
      </div>
    </div>
  );
}
