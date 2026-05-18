"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "../_form";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/admin/products/${id}`);
      const json = await res.json();
      const p = json.data || json;
      setInitialData({
        productName: p.productName || "",
        slug: p.slug || "",
        description: p.description || "",
        code: p.code || "",
        department: p.department || "",
        subDepartment: p.subDepartment || "",
        productType: p.productType || "",
        brand: p.brand || "",
        series: p.series || "",
        price: String(p.price || ""),
        wholesalePrice: p.wholesalePrice ? String(p.wholesalePrice) : "",
        stock: String(p.stock || ""),
        active: p.active ?? true,
        isFeatured: p.isFeatured ?? false,
        freeShipping: p.freeShipping ?? false,
        categoryId: p.category?.documentId || "",
        images: Array.isArray(p.images) ? p.images : [],
      });
      setLoading(false);
    })();
  }, [id]);

  if (loading) return (
    <div className="p-8 animate-pulse text-slate-400 text-[10px] font-black uppercase tracking-widest">Cargando producto...</div>
  );

  if (!initialData) return (
    <div className="p-8 text-red-500 text-[10px] font-black uppercase tracking-widest">Producto no encontrado</div>
  );

  return <ProductForm documentId={id} initialData={initialData} />;
}
