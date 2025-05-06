/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '**',
      },
    ],
  },
  // Enable output in standalone mode for Docker deployment
  output: 'standalone',
  // Disable ESLint during builds
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript checking during builds
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  // Disable all experimental features
  experimental: {
    // Disable all experimental features
    ppr: false,
    // Disable optimizations that might cause issues
    optimizeCss: false
  },
  // External packages configuration
  serverExternalPackages: [],
  // Skip prerendering of problematic pages
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  // Disable static optimization for 404 pages
  excludeDefaultMomentLocales: true,
};

module.exports = nextConfig;
