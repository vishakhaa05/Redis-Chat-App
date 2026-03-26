import type { NextConfig } from "next";
import { hostname } from "os";

const nextConfig: NextConfig = {
  images: {
    remotePatterns:[{hostname:"res.cloudinary.com"}] 
  },/* config options here */
  reactCompiler: true,
};

export default nextConfig;
