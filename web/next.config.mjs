/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.mux.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
