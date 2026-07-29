import type { CapacitorConfig } from '@capacitor/cli';

// El sitio usa API routes de Next.js con render en servidor (no es un sitio
// estatico), asi que Capacitor no empaqueta el build: la WebView carga
// directo el dominio en produccion, igual que un navegador normal. La
// carpeta "mobile-shell" (webDir) nunca se muestra en tiempo de ejecucion,
// solo la exige Capacitor para inicializar el proyecto.
const config: CapacitorConfig = {
  appId: 'mx.refaccionesixoye.app',
  appName: 'Refacciones Ixoye',
  webDir: 'mobile-shell',
  server: {
    url: 'https://www.refaccionesixoye.mx',
    cleartext: false,
  },
};

export default config;
