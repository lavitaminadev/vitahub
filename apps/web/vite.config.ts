import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'VITAHUB',
        short_name: 'VITAHUB',
        description: 'Sistema de Gestión de Agencia',
        theme_color: '#1a1a2e',
        icons: [{ src: 'favicon.ico', sizes: '64x64', type: 'image/x-icon' }],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
})
