/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    experimental: {
        serverComponentsExternalPackages: ['shiki', 'vscode-oniguruma'],
    },
};

export default nextConfig;
