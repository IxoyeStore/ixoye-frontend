import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const API = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 100;
const MAX_PAGES = 50; // safety cap (~5000 items per collection)

async function fetchAllSlugs(
  endpoint: string,
  extraFilters = "",
): Promise<{ slug: string; updatedAt?: string }[]> {
  const items: { slug: string; updatedAt?: string }[] = [];
  let page = 1;

  while (page <= MAX_PAGES) {
    const res = await fetch(
      `${API}${endpoint}?fields[0]=slug&fields[1]=updatedAt${extraFilters}` +
        `&pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) break;
    const json = await res.json();
    const data = json.data || [];
    for (const item of data) {
      if (item.slug) items.push({ slug: item.slug, updatedAt: item.updatedAt });
    }
    const pageCount = json.meta?.pagination?.pageCount || 1;
    if (page >= pageCount) break;
    page++;
  }

  return items;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    fetchAllSlugs("/api/products", "&filters[active][$eq]=true"),
    fetchAllSlugs("/api/categories"),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/category`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/info`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/sucursales`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/terms-and-conditions`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: "yearly", priority: 0.1 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
