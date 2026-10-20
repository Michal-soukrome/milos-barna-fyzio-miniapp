import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/configurator", destination: "/navody", permanent: true },
      { source: "/pruvodce", destination: "/navody", permanent: true },
      { source: "/about", destination: "/o-lekari", permanent: true },
      {
        source: "/contact",
        destination: "/kontakt",
        permanent: true,
      },
      { source: "/articles", destination: "/clanky", permanent: true },
      {
        source: "/articles/:slug",
        destination: "/clanky/:slug",
        permanent: true,
      },
      { source: "/t/:slug", destination: "/navody/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
