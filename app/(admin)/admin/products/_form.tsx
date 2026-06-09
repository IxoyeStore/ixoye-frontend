"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, Loader2, Upload, X, ImageIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type ProductFormData = {
  productName: string;
  slug: string;
  description: string;
  code: string;
  department: string;
  subDepartment: string;
  productType: string;
  category: string;
  brand: string;
  series: string;
  motors: string;
  oemCode: string;
  price: string;
  wholesalePrice: string;
  stock: string;
  active: boolean;
  isFeatured: boolean;
  freeShipping: boolean;
};

const EMPTY: ProductFormData = {
  productName: "", slug: "", description: "", code: "",
  department: "", subDepartment: "", productType: "", category: "",
  brand: "", series: "", motors: "", oemCode: "",
  price: "", wholesalePrice: "", stock: "",
  active: true, isFeatured: false, freeShipping: false,
};

function slugify(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-[12px] font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-sky-400 dark:focus:border-sky-500 transition-colors";

export default function ProductForm({
  documentId,
  initialData,
}: {
  documentId?: string;
  initialData?: Partial<ProductFormData> & { categoryId?: string; images?: string[] };
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>({ ...EMPTY, ...initialData });
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>(initialData?.images ?? []);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories?page=1")
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []));
  }, []);

  useEffect(() => {
    if (initialData?.categoryId) setForm((f) => ({ ...f, category: initialData.categoryId! }));
  }, [initialData?.categoryId]);

  const set = (field: keyof ProductFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
      setForm((f) => {
        const next = { ...f, [field]: val };
        if (field === "productName" && !documentId) next.slug = slugify(String(val));
        return next;
      });
    };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("files", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        const url = Array.isArray(data) ? data[0]?.url : data?.url;
        if (url) newUrls.push(url);
      } else {
        toast.error(`Error al subir ${file.name}`);
      }
    }

    if (newUrls.length > 0) {
      setImages((prev) => [...prev, ...newUrls]);
      toast.success(`${newUrls.length} imagen(es) subida(s)`);
    }
    setUploading(false);
    e.target.value = "";
  };

  const removeImage = (url: string) => setImages((prev) => prev.filter((u) => u !== url));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload: any = {
      productName: form.productName,
      slug: form.slug,
      description: form.description,
      code: form.code,
      department: form.department,
      subDepartment: form.subDepartment,
      productType: form.productType,
      brand: form.brand,
      series: form.series,
      motors: form.motors || null,
      oemCode: form.oemCode || null,
      price: parseFloat(form.price) || 0,
      wholesalePrice: form.wholesalePrice ? parseFloat(form.wholesalePrice) : null,
      stock: form.stock !== "" ? parseInt(form.stock) : 0,
      active: form.active,
      isFeatured: form.isFeatured,
      freeShipping: form.freeShipping,
      images,
    };

    if (form.category) payload.category = form.category;

    const url = documentId ? `/api/admin/products/${documentId}` : "/api/admin/products";
    const method = documentId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success(documentId ? "Producto actualizado" : "Producto creado");
      if (!documentId) router.push("/admin/products");
    } else {
      const err = await res.json();
      console.error("Strapi error:", err);
      const msg = err?.error?.message || err?.error?.details?.errors?.[0]?.message || "Error al guardar el producto";
      toast.error(msg);
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 w-full md:max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center gap-2 md:gap-4">
        <Link href="/admin/products" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors">
          <ChevronLeft size={14} /> Productos
        </Link>
        <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white italic">
          {documentId ? "Editar Producto" : "Nuevo Producto"}
        </h1>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-6">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Información General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Nombre del Producto" required>
            <input type="text" value={form.productName} onChange={set("productName")} required className={inputCls} />
          </Field>
          <Field label="Slug (URL)" required>
            <input type="text" value={form.slug} onChange={set("slug")} required className={inputCls} />
          </Field>
          <Field label="Código de Parte" required>
            <input type="text" value={form.code} onChange={set("code")} required className={inputCls} />
          </Field>
        </div>
        <Field label="Descripción">
          <textarea value={form.description} onChange={set("description")} rows={3} className={`${inputCls} resize-none`} />
        </Field>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-6">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Clasificación</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Categoría">
            <select value={form.category} onChange={set("category")} className={inputCls}>
              <option value="">Sin categoría</option>
              {categories.map((c: any) => (
                <option key={c.documentId} value={c.documentId}>{c.categoryName}</option>
              ))}
            </select>
          </Field>
          <Field label="Departamento" required>
            <input type="text" value={form.department} onChange={set("department")} required className={inputCls} />
          </Field>
          <Field label="Sub-Departamento" required>
            <input type="text" value={form.subDepartment} onChange={set("subDepartment")} required className={inputCls} />
          </Field>
          <Field label="Tipo de Producto" required>
            <input type="text" value={form.productType} onChange={set("productType")} required className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-5 md:col-span-2">
            <Field label="Marca" required>
              <input type="text" value={form.brand} onChange={set("brand")} required className={inputCls} />
            </Field>
            <Field label="Código OEM">
              <input type="text" value={form.oemCode} onChange={set("oemCode")} placeholder="Ej: 16400-0L010" className={inputCls} />
            </Field>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Serie / Modelo">
            <textarea value={form.series} onChange={set("series")} placeholder="Ej: Hilux, NPR, F-350" rows={5} className={`${inputCls} resize-none overflow-y-auto`} />
          </Field>
          <Field label="Motores Compatibles">
            <textarea value={form.motors} onChange={set("motors")} placeholder="Ej: 4JJ1, 6BT Cummins, Perkins 1006" rows={5} className={`${inputCls} resize-none overflow-y-auto`} />
          </Field>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-6">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Precios y Stock</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Field label="Precio (MXN)" required>
            <input type="number" min="0" step="0.01" value={form.price} onChange={set("price")} required className={inputCls} />
          </Field>
          <Field label="Precio Mayoreo (MXN)">
            <input type="number" min="0" step="0.01" value={form.wholesalePrice} onChange={set("wholesalePrice")} className={inputCls} />
          </Field>
          <Field label="Stock" required>
            <input type="number" min="0" value={form.stock} onChange={set("stock")} required className={inputCls} />
          </Field>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-4">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Opciones</h2>
        <div className="flex flex-wrap gap-6">
          {([
            { field: "active", label: "Activo (visible en tienda)" },
            { field: "isFeatured", label: "Producto Destacado" },
            { field: "freeShipping", label: "Envío Gratis Nayarit" },
          ] as { field: keyof ProductFormData; label: string }[]).map(({ field, label }) => (
            <label key={field} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={form[field] as boolean}
                onChange={set(field)}
                className="w-4 h-4 rounded border-slate-300 accent-sky-600"
              />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Imágenes del Producto</h2>
          <label className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${uploading ? "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed" : "bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/50 border border-sky-200 dark:border-sky-800"}`}>
            {uploading
              ? <Loader2 size={14} className="animate-spin" />
              : <Upload size={14} />}
            {uploading ? "Subiendo..." : "Subir Imágenes"}
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>

        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-300 dark:text-slate-600 gap-3">
            <ImageIcon size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest">Sin imágenes</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((url, i) => (
              <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Imagen ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">
                  {i + 1}
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-[9px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">
          Las imágenes se suben a Cloudinary vía Strapi. Hover sobre una imagen para eliminarla.
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <Link href="/admin/products" className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 transition-all">
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-700 disabled:opacity-50 transition-all shadow-lg shadow-sky-200"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Guardando..." : "Guardar Producto"}
        </button>
      </div>
    </form>
  );
}
