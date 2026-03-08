import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    server: {
        port: 5173,
        proxy: {
            // Only proxy REST API requests
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
            },
            // We removed the /socket.io proxy to connect directly to the backend
            // This prevents Vite HMR Proxy from interfering with Websockets
        },
    },
});
