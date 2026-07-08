import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { patchCssModules } from 'vite-css-modules';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [patchCssModules(), svgr(), react()],
  assetsInclude: ['**/*.hdr', '**/*.glb', '**/*.woff', '**/*.woff2', '**/*.fbx'],
  define: {
    'process.env': {},
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api/graphql': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/static': {
        target: 'https://rudalle-coordinator.dev.sberdevices.ru',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});