import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const config = {
  output: "standalone",
  // Needed for pnpm monorepo: trace files from the workspace root
  outputFileTracingRoot: path.join(__dirname, "../../"),
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      // Allow images from S3 / R2 / CDN — add your bucket domain here
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "cdn.plothole.org" },
    ],
  },
  // Silence mapbox-gl SSR warning
  webpack(config) {
    return config;
  },
};

export default config;
