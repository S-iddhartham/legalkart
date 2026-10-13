/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Lawyer photos and product imagery are served from the LegalKart CDN.
    remotePatterns: process.env.NEXT_PUBLIC_IMAGE_HOST
      ? [{ protocol: "https", hostname: process.env.NEXT_PUBLIC_IMAGE_HOST }]
      : [],
  },
};

export default nextConfig;
