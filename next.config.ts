import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.31.83"],
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
