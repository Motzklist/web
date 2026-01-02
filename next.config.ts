import type { NextConfig } from 'next';

/**
 * Next.js Configuration
 *
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js
 */
const nextConfig: NextConfig = {
    // Enable standalone output for optimized Docker production builds
    // This creates a self-contained build that doesn't require node_modules
    output: 'standalone',

    // Environment variables accessible at build time and runtime
    // NEXT_PUBLIC_* variables are automatically exposed to the browser
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    },

    // Disable x-powered-by header for security
    poweredByHeader: false,
};

export default nextConfig;
