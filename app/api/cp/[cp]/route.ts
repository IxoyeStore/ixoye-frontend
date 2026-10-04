import { NextResponse } from "next/server";
import cpMexico from "@/lib/cp-mexico.json";

// El catalogo de CP (~4.5 MB) vive solo en el servidor; antes se mandaba
// completo al navegador. La respuesta no cambia, asi que la CDN la cachea.
const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ cp: string }> },
) {
  const { cp } = await params;
  if (!/^\d{5}$/.test(cp)) {
    return NextResponse.json({ entry: null }, { status: 400 });
  }
  const entry =
    (cpMexico as Record<string, { e: string; m: string; c: string[] }>)[cp] ??
    null;
  return NextResponse.json({ entry }, { headers: CACHE_HEADERS });
}
