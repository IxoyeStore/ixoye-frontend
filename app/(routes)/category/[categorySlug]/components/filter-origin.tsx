import { useGetProductField } from "@/api/getProductField";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FilterTypes } from "@/types/filters";

type FilterOriginProps = {
  filterOrigin: string;
  setFilterOrigin: (origin: string) => void;
};

const FilterOrigin = ({ filterOrigin, setFilterOrigin }: FilterOriginProps) => {
  const { result, loading }: FilterTypes = useGetProductField();

  return (
    <div className="my-5">
      <p className="mb-3 font-bold">Marca</p>

      {loading && <p>Cargando...</p>}

      <RadioGroup value={filterOrigin} onValueChange={setFilterOrigin}>
        {result?.schema.attributes.origin.enum.map((origin: string) => (
          <div key={origin} className="flex items-center space-x-2">
            <RadioGroupItem value={origin} id={origin} />
            <Label htmlFor={origin}>{origin}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default FilterOrigin;
