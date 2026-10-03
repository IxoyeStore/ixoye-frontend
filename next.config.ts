import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
