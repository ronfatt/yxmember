/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: "/Users/rms/Desktop/元像/yuanxiang app"
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*" }
    ]
  }
};

export default nextConfig;
