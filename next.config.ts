import type { NextConfig } from "next";

const appHost = process.env.APP_ORIGIN
  ? new URL(process.env.APP_ORIGIN).host
  : "";

const nextConfig: NextConfig = {
  // Enable the styled-components SWC transform (SSR support, consistent class
  // names, and better debugging) required by BigDesign.
  compiler: {
    styledComponents: true,
  },

  logging: { fetches: { fullUrl: true } },
  experimental: {
    serverActions: {
      allowedOrigins: [appHost, "localhost:3000"].filter(Boolean),
    },
  },
};

export default nextConfig;
