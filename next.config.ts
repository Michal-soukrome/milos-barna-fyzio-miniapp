import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.31.83"],
  async redirects() {
    return [
      {
        source: "/configurator",
        destination: "/pruvodce",
        permanent: true,
      },
      {
        source: "/konfigurator",
        destination: "/pruvodce",
        permanent: true,
      },
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
