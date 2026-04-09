import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: [],
};

nextConfig.allowedDevOrigins = ['10.202.212.111'];

export default nextConfig;
