/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Apply to all calculator routes
        source: "/:path*",
        headers: [
          {
            // Allow embedding in iframes (required for Squarespace embeds)
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
