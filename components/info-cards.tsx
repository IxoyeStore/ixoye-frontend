"use client";
import { useState } from "react";
import { Truck, BadgePercent, Store, Search, X } from "lucide-react";
import Link from "next/link";
import cpMexico from "@/lib/cp-mexico.json";

const MUNICIPIOS_CON_ENVIO = new Set([
  "Tepic",
  "Xalisco",
  "Bahía de Banderas",
  "Compostela",
  "Ixtlán del Río",
  "Jala",
  "San Pedro Lagunillas",
  "Santa María del Oro",
  "Ahuacatlán",
  "Santiago Ixcuintla",
  "San Blas",
  "Tecuala",
  "Acaponeta",
  "Rosamorada",
  "Ruíz",
  "Tuxpan",
]);

const InfoCards = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cp, setCp] = useState("");
  const [resultado, setResultado] = useState<string | null>(null);
  const [disponible, setDisponible] = useState<boolean | null>(null);

  const consultarEnvio = () => {
    if (cp.length < 5) return;
    const entry = (cpMexico as Record<string, { e: string; m: string }>)[cp];
    if (!entry) {
      setResultado("Código postal no encontrado.");
      setDisponible(false);
      return;
    }
    if (entry.e === "Nayarit") {
      if (MUNICIPIOS_CON_ENVIO.has(entry.m)) {
        setResultado(`¡Envío GRATIS a ${entry.m}, Nayarit!`);
        setDisponible(true);
      } else {
        setResultado(`Lo sentimos, no contamos con servicio de envío a ${entry.m}. Contáctanos para más información.`);
        setDisponible(false);
      }
    } else {
      setResultado(`Envío no disponible a ${entry.m}, ${entry.e}. Comunícate con nosotros.`);
      setDisponible(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Envíos */}
        <div className="flex items-center gap-4 p-6 border border-sky-100 rounded-lg bg-white shadow-sm shadow-sky-50">
          <Truck className="w-10 h-10 text-sky-700 shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-sky-900">Envíos en Nayarit</h3>
            <p className="text-sm text-sky-600">
              Consulta la disponibilidad de envíos{" "}
              <button
                onClick={() => setIsModalOpen(true)}
                className="font-bold underline text-sky-800 hover:text-sky-500 transition-colors"
              >
                aquí
              </button>
              .
            </p>
          </div>
        </div>

        {/* Promociones */}
        <div className="flex items-center gap-4 p-6 border border-sky-100 rounded-lg bg-white shadow-sm shadow-sky-50">
          <BadgePercent className="w-10 h-10 text-sky-700 shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-sky-900">Promociones</h3>
            <p className="text-sm text-sky-600">
              Aprovecha descuentos especiales y ofertas por tiempo limitado.
            </p>
          </div>
        </div>

        {/* Tiendas físicas */}
        <div className="flex items-center gap-4 p-6 border border-sky-100 rounded-lg bg-white shadow-sm shadow-sky-50">
          <Store className="w-10 h-10 text-sky-700 shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-sky-900">Tiendas físicas</h3>
            <p className="text-sm text-sky-600">
              Visítanos en nuestras{" "}
              <Link
                href="/sucursales"
                className="font-bold underline text-sky-800 hover:text-sky-500 transition-colors"
              >
                sucursales
              </Link>{" "}
              y recibe atención personalizada.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL DE CONSULTA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => { setIsModalOpen(false); setResultado(null); setCp(""); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="text-center space-y-4">
              <div className="bg-sky-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Truck className="text-sky-600 w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-sky-900">Calcula tu envío</h2>
              <p className="text-sm text-gray-500">
                Ingresa tu código postal para conocer el costo de envío.
              </p>

              <input
                type="text"
                maxLength={5}
                value={cp}
                placeholder="Ej: 63000"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all text-center text-lg font-semibold"
                onChange={(e) => { setCp(e.target.value.replace(/\D/g, "")); setResultado(null); setDisponible(null); }}
                onKeyDown={(e) => e.key === "Enter" && consultarEnvio()}
              />

              <button
                disabled={cp.length < 5}
                className="w-full bg-sky-700 hover:bg-sky-800 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-sky-100 flex items-center justify-center gap-2"
                onClick={consultarEnvio}
              >
                <Search size={18} />
                Consultar
              </button>

              {resultado && (
                <div className={`p-3 rounded-lg text-sm font-medium animate-in slide-in-from-top-1 ${
                  disponible
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-700"
                }`}>
                  {resultado}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default InfoCards;
