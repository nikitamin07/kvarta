import type { NextConfig } from "next";
import { SECURITY_HEADERS } from "./src/lib/csp";
import { SITE_INDEXING } from "./src/lib/site";

const NOINDEX = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  async headers() {
    const headers = SITE_INDEXING ? SECURITY_HEADERS : [...SECURITY_HEADERS, ...NOINDEX];
    return [{ source: "/:path*", headers }];
  },
};

export default nextConfig;
