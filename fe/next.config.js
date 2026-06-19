/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // iOS 14 (Safari 14.1) cannot PARSE private class methods (`#method()`, Safari 15+).
  // These deps ship that syntax in their dist and Next does NOT transpile node_modules
  // by default — so SWC leaves it as-is → SyntaxError → app crash on iOS 14.
  // Listing them here makes SWC down-level their syntax to the `browserslist` target
  // (Safari >= 14) in package.json. (COMPAT-IOS14-1)
  transpilePackages: [
    '@tanstack/react-query',
    '@tanstack/query-core',
    '@radix-ui/react-slot',
  ],
}

module.exports = nextConfig
