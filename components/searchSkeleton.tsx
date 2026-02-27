import { Skeleton } from "@/components/ui/skeleton";

export default function SearchSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-12 animate-pulse">
      {/* SECCIÓN LATERAL DE FILTROS */}
      <aside className="hidden md:block w-64 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-4 w-28 bg-slate-200" />{" "}
          {/* Título Especificaciones */}
        </div>

        <div className="space-y-8">
          <div>
            <Skeleton className="h-3 w-32 mb-4 bg-slate-100" />{" "}
            {/* Fabricante / Marca */}
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded-sm bg-slate-100" />
                  <Skeleton className="h-3 w-24 bg-slate-50" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* GRID DE PRODUCTOS */}
      <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex flex-col gap-4">
            {/* Contenedor de Imagen */}
            <Skeleton className="aspect-square w-full rounded-2xl bg-slate-100" />

            {/* Detalles del Producto */}
            <div className="space-y-3">
              <Skeleton className="h-3 w-full bg-slate-100" />
              <Skeleton className="h-3 w-2/3 bg-slate-50" />

              {/* Footer de la tarjeta */}
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-5 w-16 bg-slate-100" />
                <Skeleton className="h-9 w-9 rounded-xl bg-slate-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
