import type { MetadataRoute } from "next";
import { getPublicAppUrl } from "@/lib/app-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = getPublicAppUrl();

  return [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
