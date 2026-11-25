import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { allPages } from "@/lib/pages";

export default function sitemap(): MetadataRoute.Sitemap {
  return allPages
    .filter((p) => !p.noIndex)
    .map((p) => ({
      url: absoluteUrl(p.path),
      ...(p.lastModified ? { lastModified: p.lastModified } : {}),
      changeFrequency: p.changeFrequency ?? "monthly",
      priority: p.priority ?? 0.7,
    }));
}
