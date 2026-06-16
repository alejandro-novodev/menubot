import type { NextConfig } from "next";

// Build-time version marker. Railway injects RAILWAY_GIT_COMMIT_SHA at build;
// expose the short SHA as a public constant so the footer can show what's live.
const APP_VERSION = (process.env.RAILWAY_GIT_COMMIT_SHA ?? "dev").slice(0, 7);

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: APP_VERSION,
  },
};

export default nextConfig;
