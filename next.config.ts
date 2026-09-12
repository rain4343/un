import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const api = process.env.API_ORIGIN ?? "http://localhost:4000";
    return [{ source: "/backend/:path*", destination: `${api}/:path*` }];
  },
};

export default withNextIntl(nextConfig);