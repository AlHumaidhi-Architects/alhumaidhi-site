import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Editors can point any image at any HTTPS host (Unsplash, Supabase Storage, …).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
