/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'avatars.githubusercontent.com',  // Allow GitHub avatar images
      'github.com',                     // Allow GitHub domain images
      'raw.githubusercontent.com'       // Allow raw GitHub content
    ],
  },
};

module.exports = nextConfig;
