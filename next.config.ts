import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns:[{hostname:"res.cloudinary.com"}] 
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactCompiler: true,
};

export default nextConfig;
