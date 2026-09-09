import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output is required for the Heroku Procfile
  // (`node .next/standalone/server.js`), which listens on 0.0.0.0:$PORT.
  output: 'standalone',
};

export default nextConfig;
