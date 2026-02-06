"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Search, ChevronDown, Tractor, Settings, Cpu } from "lucide-react";

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
    if (!isOpen || !type) return;

    const fetchStep1 = async () => {
      setLoading(true);
      try {
        const field = FIELD_MAP[type];

        const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/products?filters[${field}][$notNull]=true&fields[0]=${field}&pagination[pageSize]=100`;

        const response = await fetch(url);
        const json = await response.json();

        if (json.data) {
          const values = json.data.map((item: any) => item[field]);

          const unique = Array.from(
            new Set(values.filter(Boolean)),
          ) as string[];
          setOptions({ step1: unique.sort(), step2: [] });
        }
      } catch (e) {
        console.error("Error cargando series:", e);
      } finally {
        setLoading(false);
      }
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
        const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/products?filters[${field}][$eq]=${encodeURIComponent(selections.step1)}&fields[0]=productType&pagination[pageSize]=100`;

        const response = await fetch(url);
        const json = await response.json();

        if (json.data) {
          const values = json.data.map((item: any) => item.productType);
          const uniqueTypes = Array.from(
            new Set(values.filter(Boolean)),
          ) as string[];
          setOptions((prev) => ({
            ...prev,
            step2: uniqueTypes.sort(),
          }));
        }
      } catch (e) {
        console.error("Error Step 2:", e);
      } finally {
        setLoadingStep2(false);
      }
    };

    fetchStep2();
  }, [selections.step1, type]);

  if (!isOpen || !type) return null;

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (selections.step1) params.append("series", selections.step1);
    if (selections.step2) params.append("type", selections.step2);

    router.push(`/search?${params.toString()}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Encabezado  */}
        <div className="p-7 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-lg shadow-slate-200">
              {type === "tractor" ? (
                <Tractor size={22} />
              ) : (
                <Settings size={22} />
              )}
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                Buscador por Aplicación
              </h2>
              <p className="text-[9px] text-blue-600 font-bold uppercase tracking-[0.2em] mt-1">
                Localización de {type}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* SELECCIÓN DE MODELO */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block ml-1">
              01. Identificar Modelo / Serie
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-400 cursor-pointer uppercase transition-all disabled:opacity-50"
                value={selections.step1}
                onChange={(e) =>
                  setSelections({ step1: e.target.value, step2: "" })
                }
                disabled={loading}
              >
                <option value="">
                  {loading
                    ? "Cargando Base de Datos..."
                    : "-- SELECCIONAR SERIE --"}
                </option>
                {options.step1.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={16}
              />
            </div>
          </div>

          {/* SELECCIÓN DE SISTEMA */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block ml-1">
              02. Filtrar por Sistema
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-400 cursor-pointer uppercase transition-all disabled:opacity-50"
                value={selections.step2}
                onChange={(e) =>
                  setSelections({ ...selections, step2: e.target.value })
                }
                disabled={!selections.step1 || loadingStep2}
              >
                <option value="">
                  {loadingStep2
                    ? "Consultando Sistemas..."
                    : "-- TODOS LOS SISTEMAS --"}
                </option>
                {options.step2.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <Cpu
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={16}
              />
            </div>
          </div>

          {/* Botón de Ejecución */}
          <button
            onClick={handleSearch}
            disabled={!selections.step1}
            className="w-full py-5 bg-slate-900 hover:bg-black disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.97]"
          >
            <Search size={18} strokeWidth={3} /> Consultar Catálogo
          </button>
        </div>
      </div>
    </div>
  );
}
