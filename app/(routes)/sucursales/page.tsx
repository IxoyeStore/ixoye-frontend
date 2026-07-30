import { MapPin, Navigation } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

type Sucursal = { id: number; name: string; address: string; mapsUrl: string };

async function fetchSucursales(): Promise<Sucursal[]> {
  try {
    const res = await fetch(`${API}/api/sucursales?sort=name:asc&pagination[pageSize]=100`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export const metadata = {
  title: "Sucursales | Ixoye",
  description: "Encuentra la sucursal Ixoye más cercana a ti en Nayarit.",
};

export default async function SucursalesPage() {
  const SUCURSALES = await fetchSucursales();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16 sm:px-8">
      <div className="mb-10 sm:mb-14 text-center">
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-[#001e36] dark:text-white">
          Nuestras Sucursales
        </h1>
        <p className="mt-3 text-md text-slate-600 dark:text-slate-400 font-medium">
          {SUCURSALES.length} sucursales en Nayarit para estar siempre cerca de ti. <br/> Visítanos y descubre la experiencia Ixoye en cada ubicación.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SUCURSALES.map((s) => (
          <div
            key={s.id}
            className="flex flex-col gap-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-6 shadow-sm hover:shadow-md dark:hover:shadow-none hover:border-sky-100 dark:hover:border-sky-800 transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center">
                <MapPin size={22} className="text-[#0055a4] dark:text-sky-400" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-black text-[#001e36] dark:text-white uppercase tracking-tight leading-tight">
                  {s.name}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {s.address}
                </p>
              </div>
            </div>

            <a
              href={s.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-[#0055a4] dark:border-sky-500 text-[#0055a4] dark:text-sky-400 text-xs font-black uppercase tracking-widest hover:bg-[#0055a4] hover:text-white transition-all duration-200"
            >
              <Navigation size={13} strokeWidth={2.5} />
              Ver en Maps
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
