"use client";

import { Truck, BadgePercent, Store } from "lucide-react";

const InfoCards = () => {
  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Envíos */}
        <div className="flex items-center gap-4 p-6 border border-gray-200 rounded-lg">
          <Truck className="w-10 h-10 text-gray-700 shrink-0" />
          <div>
            <h3 className="text-lg font-bold">Envíos en México</h3>
            <p className="text-sm text-gray-600">
              Realizamos envíos a todo México de forma rápida y segura.
            </p>
          </div>
        </div>

        {/* Promociones */}
        <div className="flex items-center gap-4 p-6 border border-gray-200 rounded-lg">
          <BadgePercent className="w-10 h-10 text-gray-700 shrink-0" />
          <div>
            <h3 className="text-lg font-bold">Promociones</h3>
            <p className="text-sm text-gray-600">
              Aprovecha descuentos especiales y ofertas por tiempo limitado.
            </p>
          </div>
        </div>

        {/* Tiendas físicas */}
        <div className="flex items-center gap-4 p-6 border border-gray-200 rounded-lg">
          <Store className="w-10 h-10 text-gray-700 shrink-0" />
          <div>
            <h3 className="text-lg font-bold">Tiendas físicas</h3>
            <p className="text-sm text-gray-600">
              Visítanos en nuestras sucursales y recibe atención personalizada.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoCards;
