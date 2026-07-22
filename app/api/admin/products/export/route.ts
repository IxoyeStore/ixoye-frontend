import { NextRequest, NextResponse } from "next/server";
import { getAdminJwt } from "@/lib/admin-auth";
import ExcelJS from "exceljs";

const API = process.env.NEXT_PUBLIC_API_URL;

const COLUMNS = [
  { key: "documentId",     label: "documentId",       width: 34 },
  { key: "productName",    label: "descripcion",      width: 30 },
  { key: "code",           label: "codigo",           width: 16 },
  { key: "imageCode",      label: "codigoImagen",     width: 16 },
  { key: "slug",           label: "slug",             width: 30 },
  { key: "department",     label: "departamento",     width: 20 },
  { key: "subDepartment",  label: "subDepartamento",  width: 20 },
  { key: "productType",    label: "tipoProducto",     width: 20 },
  { key: "brand",          label: "marca",            width: 16 },
  { key: "series",         label: "series",           width: 20 },
  { key: "motors",         label: "motores",          width: 20 },
  { key: "price",          label: "precio",           width: 14 },
  { key: "wholesalePrice", label: "precioMayoreo",    width: 14 },
  { key: "stock",          label: "stock",            width: 10 },
  { key: "active",         label: "activo",           width: 18 },
  { key: "isFeatured",     label: "destacado",        width: 20 },
  { key: "freeShipping",   label: "envioGratis",      width: 22 },
  { key: "description",    label: "descripcionLarga", width: 50 },
  { key: "hasImages",      label: "tieneImagenes",    width: 16 },
];

export async function GET(request: NextRequest) {
  const jwt = await getAdminJwt();
  if (!jwt) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const search   = searchParams.get("search")   || "";
  const category = searchParams.get("category") || "";
  const active   = searchParams.get("active")   || "";
  const priceMin = searchParams.get("priceMin") || "";
  const priceMax = searchParams.get("priceMax") || "";

  const all: any[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    let url = `${API}/api/products?sort=productName:asc&pagination[page]=${page}&pagination[pageSize]=100`;
    if (search)   url += `&filters[$or][0][productName][$containsi]=${encodeURIComponent(search)}&filters[$or][1][code][$containsi]=${encodeURIComponent(search)}`;
    if (category) url += `&filters[category][slug][$eq]=${encodeURIComponent(category)}`;
    if (active)   url += `&filters[active][$eq]=${active}`;
    if (priceMin) url += `&filters[price][$gte]=${priceMin}`;
    if (priceMax) url += `&filters[price][$lte]=${priceMax}`;

    const res = await fetch(url, { headers: { Authorization: `Bearer ${jwt}` }, cache: "no-store" });
    if (!res.ok) break;
    const data = await res.json();
    all.push(...(data.data || []));
    const p = data.meta?.pagination;
    hasMore = p ? page < p.pageCount : false;
    page++;
  }

  if (all.length === 0) {
    return NextResponse.json({ error: "Sin productos con los filtros seleccionados" }, { status: 404 });
  }

  all.forEach((p) => {
    p.hasImages = Array.isArray(p.images) && p.images.length > 0;
  });

  // ── Build Excel ──────────────────────────────────────────────────────────
  const wb = new ExcelJS.Workbook();
  wb.creator = "Ixoye Admin";
  wb.created = new Date();

  const ws = wb.addWorksheet("Productos", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  const tableRows = all.map((p) =>
    COLUMNS.map((c) => {
      const v = p[c.key];
      if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
      return v ?? "";
    })
  );

  ws.addTable({
    name: "TablaProductos",
    ref: "A1",
    headerRow: true,
    totalsRow: false,
    style: {
      theme: "TableStyleMedium2",
      showRowStripes: true,
    },
    columns: COLUMNS.map((c) => ({ name: c.label, filterButton: true })),
    rows: tableRows,
  });

  COLUMNS.forEach((col, i) => {
    ws.getColumn(i + 1).width = col.width;
  });

  const date = new Date().toISOString().slice(0, 10);
  const buffer = await wb.xlsx.writeBuffer();

  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="productos_${date}.xlsx"`,
    },
  });
}
