/**
 * Dynamic Rendering Documentation
 *
 * This file serves as documentation for dynamic rendering configuration in the application.
 *
 * For any page that needs to be dynamically rendered, add the following exports:
 *
 * ```typescript
 * // Mark this page as dynamically rendered
 * export const dynamic = 'force-dynamic';
 * export const fetchCache = 'force-no-store';
 * // Note: Do not use revalidate as it causes issues with Next.js build
 * ```
 *
 * List of routes that should always be dynamically rendered:
 * - /
 * - /actions
 * - /issues
 * - /pull-requests
 * - /repositories
 * - /not-found
 * - /_not-found
 *
 * Dynamic patterns that should be dynamically rendered:
 * - /repositories/[owner]/[repo]
 * - /repositories/[owner]/[repo]/issues/[issue]
 * - /repositories/[owner]/[repo]/pull/[pull]
 * - /repositories/[owner]/[repo]/actions/runs/[run]
 * - /repositories/[owner]/[repo]/actions/workflows/[workflow]
 */

/**
 * List of routes that should always be dynamically rendered
 * This helps maintain a single source of truth for dynamic routes
 */
export const dynamicRoutes = [
  '/',
  '/actions',
  '/issues',
  '/pull-requests',
  '/repositories',
  '/not-found',
  '/_not-found',
];

/**
 * Dynamic patterns that should be dynamically rendered
 */
export const dynamicPatterns = [
  /^\/repositories\/[^\/]+\/[^\/]+/,
  /^\/repositories\/[^\/]+\/[^\/]+\/issues\/[^\/]+/,
  /^\/repositories\/[^\/]+\/[^\/]+\/pull\/[^\/]+/,
  /^\/repositories\/[^\/]+\/[^\/]+\/actions\/runs\/[^\/]+/,
  /^\/repositories\/[^\/]+\/[^\/]+\/actions\/workflows\/[^\/]+/,
];
