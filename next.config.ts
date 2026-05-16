import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 允许加载外部图片域名（GitHub 头像等）
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "bu.dusays.com",
      },
    ],
  },
};

export default nextConfig;
