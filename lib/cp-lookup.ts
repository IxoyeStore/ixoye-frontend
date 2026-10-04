export type CPEntry = { e: string; m: string; c: string[] };

const cache = new Map<string, Promise<CPEntry | null>>();

// Consulta un CP contra /api/cp. Devuelve null si no existe; lanza error si
// la peticion falla, para no confundir "CP invalido" con "sin conexion".
export function lookupCP(cp: string): Promise<CPEntry | null> {
  let pending = cache.get(cp);
  if (!pending) {
    pending = fetch(`/api/cp/${cp}`)
      .then((res) => {
        if (!res.ok && res.status !== 400) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { entry: CPEntry | null }) => data.entry);
    pending.catch(() => cache.delete(cp));
    cache.set(cp, pending);
  }
  return pending;
}
