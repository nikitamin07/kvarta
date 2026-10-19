import type { MetadataRoute } from "next";
import { absolute, CONTENT_UPDATED } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: absolute("/"), lastModified: CONTENT_UPDATED }];
}
