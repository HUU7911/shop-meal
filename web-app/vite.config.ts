
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => ({
    plugins: [
        react(),

        ...(mode === 'analyze'
            ? [
                visualizer({
                    filename: 'stats.html',
                    open: true,
                    gzipSize: true,
                    brotliSize: true,
                    template: 'treemap',
                }),
            ]
            : []),
    ],

    server: {
        port: 5173,
    },

    build: {
        target: 'es2020',

        // Tối ưu JavaScript production
        minify: 'esbuild',
        cssMinify: true,
        cssCodeSplit: true,

        sourcemap: false,
        reportCompressedSize: true,

        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) return;

                    // React và React DOM
                    if (
                        /node_modules\/(react|react-dom|scheduler)\//.test(id)
                    ) {
                        return 'react-vendor';
                    }

                    // Material UI và Emotion
                    if (
                        /node_modules\/(@mui\/material|@mui\/system|@mui\/utils|@emotion)\//.test(id)
                    ) {
                        return 'mui-vendor';
                    }

                    // Material UI Icons
                    if (id.includes('/node_modules/@mui/icons-material/')) {
                        return 'mui-icons';
                    }

                    // React Router
                    if (id.includes('/node_modules/react-router')) {
                        return 'router-vendor';
                    }

                    // Socket.IO
                    if (
                        /node_modules\/(socket.io-client|socket.io-parser|engine.io-client|engine.io-parser)\//.test(id)
                    ) {
                        return 'socket-vendor';
                    }

                    // Axios
                    if (id.includes('/node_modules/axios/')) {
                        return 'http-vendor';
                    }
                },
            },
        },
    },
}));
