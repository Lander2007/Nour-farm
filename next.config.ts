import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}


export default nextConfig