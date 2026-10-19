import type { MetadataRoute } from "next";
import { robotsRules, SITE_INDEXING } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return robotsRules(SITE_INDEXING);
}
