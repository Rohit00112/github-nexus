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
  // Disable static generation for 404 pages
  skipTrailingSlashRedirect: true,
  // Skip middleware URL normalization
  skipMiddlewareUrlNormalize: true,
  // Exclude default moment locales
  excludeDefaultMomentLocales: true,
  // Page extensions
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // Disable trailing slash
  trailingSlash: false,
  // Disable React strict mode
  reactStrictMode: false,
  // Disable powered by header
  poweredByHeader: false,
  // Disable etags generation
  generateEtags: false,
  // Disable compression
  compress: false,
};

module.exports = nextConfig;
