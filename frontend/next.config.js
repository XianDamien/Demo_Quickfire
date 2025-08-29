/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/:path*' // 代理到FastAPI后端
      }
    ]
  }
}

module.exports = nextConfig
