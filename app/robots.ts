import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/cart",
        "/profile",
        "/profile/*",
        "/success",
        "/successError",
        "/confirm-email",
        "/loved-product",
        "/admin",
        "/admin/*",
        "/api/*",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
