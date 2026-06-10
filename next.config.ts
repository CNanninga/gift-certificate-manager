import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable the styled-components SWC transform (SSR support, consistent class
  // names, and better debugging) required by BigDesign.
  compiler: {
    styledComponents: true,
  },

  logging: { fetches: { fullUrl: true } },
};

export default nextConfig;
