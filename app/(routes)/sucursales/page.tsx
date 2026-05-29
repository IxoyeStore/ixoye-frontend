import { MapPin, Navigation } from "lucide-react";

const SUCURSALES = [
  {
    name: "Sucursal Libramiento Matriz",
    address: "Libramiento 312, Los Sauces (Reserva Territorial), Los Sauces, 63197 Tepic, Nay.",
    maps: "https://maps.app.goo.gl/6K8vxpxve8PYhX9a6",
  },
  {
    name: "Sucursal Emmark Libramiento",
    address: "Vicente Guerrero 298, Plan de Ayala, 63197 Tepic, Nay.",
    maps: "https://maps.app.goo.gl/3wMHA5AYVYG4CdjRA",
  },
  {
    name: "Sucursal Mezcales",
    address: "Av. San Vicente 800, Las Parotas, 63735 Mezcales, Nay.",
    maps: "https://maps.app.goo.gl/BJ4EpFc1UgbwXhVS7",
  },
  {
    name: "Sucursal Xalisco",
    address: "Blvd. Tepic-Xalisco 58, Lomas del Nayar, 63782 Xalisco, Nay.",
    maps: "https://maps.app.goo.gl/Pvr9fe6UpE3rYB7v6",
  },
  {
    name: "Sucursal San Cayetano",
    address: "Insurgentes 3, Vivero, 63511 San Cayetano, Nay.",
    maps: "https://maps.app.goo.gl/R6cn28jY9XVFEo5T9",
  },
  {
    name: "Sucursal Bucerías",
    address: "Av. Héroes de Nacozari, Flamingos, 63732 Flamingos, Nay.",
    maps: "https://maps.app.goo.gl/RUo5wi8PFk7XDab79",
  },
  {
    name: "Sucursal Compostela",
    address: "Hidalgo 347, Sta Ana, 63700 Compostela, Nay.",
    maps: "https://maps.app.goo.gl/QcLpdPbJbojjfEXP7",
  },
];

export const metadata = {
  title: "Sucursales | Ixoye",
  description: "Encuentra la sucursal Ixoye más cercana a ti en Nayarit.",
};

export default function SucursalesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16 sm:px-8">
      <div className="mb-10 sm:mb-14 text-center">
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-[#001e36]">
          Nuestras Sucursales
        </h1>
        <p className="mt-3 text-md text-slate-600 font-medium">
          {SUCURSALES.length} sucursales en Nayarit para estar siempre cerca de ti. <br/> Visítanos y descubre la experiencia Ixoye en cada ubicación.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SUCURSALES.map((s) => (
          <div
            key={s.name}
            className="flex flex-col gap-4 bg-white border border-slate-100 rounded-2xl px-6 py-6 shadow-sm hover:shadow-md hover:border-sky-100 transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center">
                <MapPin size={22} className="text-[#0055a4]" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-black text-[#001e36] uppercase tracking-tight leading-tight">
                  {s.name}
                </h2>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  {s.address}
                </p>
              </div>
            </div>

            <a
              href={s.maps}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-[#0055a4] text-[#0055a4] text-xs font-black uppercase tracking-widest hover:bg-[#0055a4] hover:text-white transition-all duration-200"
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
