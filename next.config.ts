import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components: dynamic-by-default rendering with a static prerendered
  // shell and dynamic content streamed in via Suspense (PPR). See Providers,
  // where the styled-components registry wraps children in a Suspense boundary
  // so the static shell can split from the dynamic, streamed page content.
  cacheComponents: true,
  // Enable the styled-components SWC transform (SSR support, consistent class
  // names, and better debugging) required by BigDesign.
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;
