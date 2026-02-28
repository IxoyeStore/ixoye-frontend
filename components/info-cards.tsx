"use client";
import { useState } from "react";
// Agregamos Loader2 para el estado de carga
import { Truck, BadgePercent, Store, Search, X, Loader2 } from "lucide-react";
import Link from "next/link";

const InfoCards = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cp, setCp] = useState("");
  // Nuevos estados para la lógica
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);

  const consultarEnvio = async () => {
    if (cp.length < 5) return;
    setLoading(true);
    setResultado(null);

    try {
      const response = await fetch(
        `https://api.copomex.com/query/info_cp/${cp}?token=${process.env.NEXT_PUBLIC_COPOMEX_TOKEN}`,
      );
      const data = await response.json();

      if (data.error || !data[0]?.response) {
        setResultado("Código postal no encontrado.");
      } else {
        const info = data[0].response;
        if (info.estado === "Nayarit") {
          setResultado(`¡Envío GRATIS a ${info.municipio}, Nayarit!`);
        } else {
          setResultado(
            `Envío a ${info.municipio}, ${info.estado}: $250.00 MXN`,
          );
        }
      }
    } catch (error) {
      setResultado("Error al consultar la disponibilidad.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Envíos */}
        <div className="flex items-center gap-4 p-6 border border-sky-100 rounded-lg bg-white shadow-sm shadow-sky-50">
          <Truck className="w-10 h-10 text-sky-700 shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-sky-900">Envíos en México</h3>
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
              Visítanos en nuestras sucursales y recibe atención personalizada.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL DE CONSULTA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setResultado(null);
                setCp("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="text-center space-y-4">
              <div className="bg-sky-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Truck className="text-sky-600 w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-sky-900">
                Calcula tu envío
              </h2>
              <p className="text-sm text-gray-500">
                Ingresa tu código postal para conocer costos y tiempos de
                entrega.
              </p>

              <div className="relative">
                <input
                  type="text"
                  maxLength={5}
                  value={cp}
                  placeholder="Ej: 63000"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all text-center text-lg font-semibold"
                  onChange={(e) => {
                    setCp(e.target.value.replace(/\D/g, ""));
                    setResultado(null);
                  }}
                />
              </div>

              <button
                disabled={cp.length < 5 || loading}
                className="w-full bg-sky-700 hover:bg-sky-800 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-sky-100 flex items-center justify-center gap-2"
                onClick={consultarEnvio}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Search size={18} />
                )}
                {loading ? "Consultando..." : "Consultar"}
              </button>

              {resultado && (
                <div className="p-3 rounded-lg bg-sky-50 text-sky-800 text-sm font-medium animate-in slide-in-from-top-1">
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
