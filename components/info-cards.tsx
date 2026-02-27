"use client";

import { Truck, BadgePercent, Store } from "lucide-react";

const InfoCards = () => {
  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Envíos */}
        <div className="flex items-center gap-4 p-6 border border-sky-100 rounded-lg bg-white shadow-sm shadow-sky-50">
          <Truck className="w-10 h-10 text-sky-700 shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-sky-900">Envíos en México</h3>
            <p className="text-sm text-sky-600">
              Consulta la disponibilidad de envíos.
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
    </section>
  );
};

export default InfoCards;
