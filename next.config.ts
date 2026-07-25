import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
