import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // WAJIB: Tambahkan baris ini agar Firebase bisa menjalankan aplikasi
  output: "standalone", 
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      }
    ],
  },
};

export default nextConfig;