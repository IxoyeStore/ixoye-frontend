"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

const ProductSort = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "createdAt:desc";

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px] h-9 text-xs font-bold border-slate-200 bg-white text-slate-600 focus:ring-sky-500">
          <div className="flex items-center gap-2">
            <ArrowUpDown size={14} className="text-sky-600" />
            <SelectValue placeholder="Ordenar por" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt:desc" className="text-xs">
            Más recientes
          </SelectItem>
          <SelectItem value="price:asc" className="text-xs">
            Precio: Menor a Mayor
          </SelectItem>
          <SelectItem value="price:desc" className="text-xs">
            Precio: Mayor a Menor
          </SelectItem>
          <SelectItem value="productName:asc" className="text-xs">
            Nombre: A-Z
          </SelectItem>
          <SelectItem value="stock:desc" className="text-xs">
            Mayor Existencia
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProductSort;
