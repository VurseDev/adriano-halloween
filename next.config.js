/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for better compatibility
  output: 'standalone',
  // Or use 'export' if you want fully static site
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true // Required for static exports on some platforms
  }
}

module.exports = nextConfig