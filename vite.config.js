import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  // 🚨 เพิ่ม/แก้ไขส่วนนี้
  server: {
    proxy: {
      // 1. กฎสำหรับ API Login
      '/api/login': {
        target: 'http://tanutchapol.trueddns.com:47333', // 👈 เซิร์ฟเวอร์ Login
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/login/, ''), // ลบ /api/login
      },

      // 2. กฎสำหรับ API Chat (AI)
      '/api/chat': {
        target: 'http://tanutchapol.trueddns.com:47333', // 👈 ใช้ backend ใหม่ที่ให้มา
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chat/, ''), // ลบ /api/chat
      },

      // 3. กฎสำหรับ Facebook API
      '/apifb': {
        target: 'http://tanutchapol.trueddns.com:47333',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/apifb/, ''),
      }
    }
  }
})