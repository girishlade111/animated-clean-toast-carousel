/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export — the app is 100% client-side (no API routes, no SSR data
  // needs), so it deploys anywhere as plain HTML/CSS/JS.
  output: "export",
  // Lint and type errors fail the build on purpose — they caught real bugs
  // (e.g. the LucideIcon mismatch in carousel.tsx). Keep these strict.
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
