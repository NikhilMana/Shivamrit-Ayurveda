import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.higgs.ai",
      },
      {
        protocol: "https",
        hostname: "shrug-person-78902957.figma.site",
      },
    ],
  },
};

export default nextConfig;
