import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Vercel sirve /public con max-age=0, así que cada visita volvía a
        // pedir las imágenes. Un día de caché en navegador y una semana en CDN.
        source: "/:all*(png|jpg|jpeg|webp|svg|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "refaccionesixoye.mx" }],
        destination: "https://www.refaccionesixoye.mx/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    // Sin optimizacion de Vercel (limite de 5K transformaciones/mes en Hobby).
    // Cloudinary optimiza via lib/image-loader.ts.
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ixoye-backend-production.up.railway.app",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
