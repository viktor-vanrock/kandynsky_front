import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { patchCssModules } from 'vite-css-modules';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [patchCssModules(), svgr(), react()],
  assetsInclude: ['**/*.hdr', '**/*.glb', '**/*.woff', '**/*.woff2', '**/*.fbx'],
  define: {
    'process.env': {},
  },
  server: {
    proxy: {
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
