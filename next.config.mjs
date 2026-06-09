/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable the styled-components SWC transform (SSR support, consistent class
  // names, and better debugging) required by BigDesign.
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;
