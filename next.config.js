/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5001',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'i.scdn.co',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.spotifycdn.com',
                pathname: '/**',
            },
        ],
    },
};

module.exports = nextConfig; 