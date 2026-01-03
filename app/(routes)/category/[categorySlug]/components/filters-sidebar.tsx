"use client";

interface Props {
  filters: any[];
}

const FiltersSidebar = ({ filters }: Props) => {
  return (
    <aside className="w-full p-4 border rounded-lg sm:w-64">
      <h4 className="mb-4 text-lg font-semibold">Filtros</h4>

      {filters.map((filter) => (
        <div key={filter.id} className="mb-6">
          <p className="mb-2 font-medium">{filter.name}</p>

          {filter.type === "checkbox" && (
            <div className="space-y-1">
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span>Opción</span>
              </label>
            </div>
          )}

          {filter.type === "range" && <input type="range" className="w-full" />}
        </div>
      ))}
    </aside>
  );
};

export default FiltersSidebar;
