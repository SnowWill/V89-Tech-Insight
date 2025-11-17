import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  // 🚨 เพิ่ม/แก้ไขส่วนนี้
  server: {
    proxy: {
      // Proxy login routes -> local demo backend
      '/api/login': {
        target: 'http://localhost:47333',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/login/, ''),
      },

      // Proxy chat routes -> local demo backend
      '/api/chat': {
        target: 'http://localhost:47333',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chat/, ''),
      },

      // Proxy Facebook helper routes (apifb) -> local demo backend
      '/apifb': {
        target: 'http://localhost:47333',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/apifb/, ''),
      },

      // General /api -> backend (images, other api calls)
      '/api': {
        target: 'http://localhost:47333',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
})
