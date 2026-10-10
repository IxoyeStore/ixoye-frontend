import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Crawlers que descargan sitios completos (entrenamiento de IA y herramientas
// SEO) sin traer clientes. Los buscadores (Googlebot, Bingbot, OAI-SearchBot,
// PerplexityBot) siguen permitidos.
const BLOCKED_BOTS = [
  "GPTBot",
  "CCBot",
  "ClaudeBot",
  "anthropic-ai",
  "Bytespider",
  "Amazonbot",
  "meta-externalagent",
  "FacebookBot",
  "Google-Extended",
  "Applebot-Extended",
  "cohere-ai",
  "Diffbot",
  "PetalBot",
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "DataForSeoBot",
  "BLEXBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
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
      { userAgent: BLOCKED_BOTS, disallow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
