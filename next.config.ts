import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://192.168.0.69:3000',
  ],
};

export default nextConfig;
