/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use standalone output for production builds
  output: process.env.BUILD_STANDALONE === '1' ? 'standalone' : undefined,
  experimental: {
    // This helps with module resolution when using npm link
    externalDir: true,
  },
  webpack: (config, { isServer }) => {
    // Handle module resolution for linked packages
    config.resolve.symlinks = true
    
    // Add fallback for monaco-editor
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      }
    }
    
    return config
  },
}

module.exports = nextConfig