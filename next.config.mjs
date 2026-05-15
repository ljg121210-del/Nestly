/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "tile.openstreetmap.org" },
      { protocol: "https", hostname: "a.tile.openstreetmap.org" },
      { protocol: "https", hostname: "b.tile.openstreetmap.org" },
      { protocol: "https", hostname: "c.tile.openstreetmap.org" }
    ]
  }
};
export default nextConfig;
