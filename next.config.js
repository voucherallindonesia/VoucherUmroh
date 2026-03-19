/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Uncomment basePath jika deploy ke subfolder repo (username.github.io/repo-name)
  // basePath: '/voucher-umroh',
}

module.exports = nextConfig
