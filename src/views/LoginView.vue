<template>
  <div class="min-h-screen flex items-center justify-center bg-[#0f172a] bg-gradient-to-br from-[#0f172a] to-[#1e293b]">

    <div class="glass rounded-3xl w-full max-w-md p-8 border border-white/10 shadow-xl">

      <div class="flex items-center gap-3 mb-6">
        <div class="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">V</div>
        <div>
          <h1 class="text-2xl font-bold text-white">Chatbot N8N</h1>
          <p class="text-sm text-gray-300">ป้อน PIN 6 หลักเพื่อเข้าใช้งาน</p>
        </div>
      </div>

      <form @submit.prevent="login" class="space-y-4">
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-gray-200 text-sm">PIN 6 หลัก</label>
          </div>
          <PinInput v-model="pin" :length="6" :masked="!showPin" :error="error" aria-label="PIN 6 หลัก" />
        </div>
        <button
          type="button"
          @click="showPin = !showPin"
          class="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-gray-200 hover:bg-white/20 flex items-center justify-center"
          :aria-pressed="showPin.toString()"
          :aria-label="showPin ? 'ซ่อนรหัส' : 'แสดงรหัส'"
          :title="showPin ? 'ซ่อนรหัส' : 'แสดงรหัส'"
        >
          <!-- Eye icon (show) -->
          <svg v-if="!showPin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
            <path d="M12 5c-4.5 0-8.3 2.6-10 7 1.7 4.4 5.5 7 10 7s8.3-2.6 10-7c-1.7-4.4-5.5-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
          </svg>
          <!-- Eye-off icon (hide) -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
            <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l2.07 2.07C2.29 7.04 1.14 8.78 1 12c1.7 4.44 5.5 7 10 7 2.02 0 3.87-.5 5.45-1.42l3.02 3.02a.75.75 0 1 0 1.06-1.06l-18.06-18Zm13.5 15.62A8.96 8.96 0 0 1 11 19c-4.03 0-7.2-2.25-8.82-6 .29-.69.66-1.31 1.11-1.87l3.03 3.03A5 5 0 0 0 12 17c.69 0 1.34-.13 1.94-.37Zm-6.6-6.6 3.18 3.18a2.5 2.5 0 0 1-3.18-3.18ZM12 7a5 5 0 0 1 5 5c0 .53-.08 1.03-.23 1.5l3.3 3.3c1.12-1.04 2-2.36 2.93-4.8-1.7-4.44-5.5-7-10-7-1.3 0-2.55.2-3.72.58l1.9 1.9c.27-.05.55-.08.82-.08Z"/>
          </svg>
        </button>
  <label class="block text-gray-200 text-xs mt-2">* ต้องเป็นตัวเลข 6 หลัก</label>

        <button :disabled="!isSixDigits || loading"
          class="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
          <span v-if="!loading">เข้าสู่ระบบ</span>
          <span v-else>
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            กำลังตรวจสอบ...
          </span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import PinInput from '../components/PinInput.vue'

const router = useRouter()
const pin = ref('')
const error = ref('')
const loading = ref(false)
const showPin = ref(false)

// อนุญาตเฉพาะตัวเลข และต้องครบ 6 หลัก
const isSixDigits = computed(() => /^\d{6}$/.test(pin.value))

// (ตรวจสอบว่า API_URL ถูกต้องตาม Proxy ของคุณ)
const API_URL = '/api/login/auth/pin/login'

async function login() {
  error.value = ''
  loading.value = true

  if (pin.value.length !== 6) {
    error.value = 'กรุณากรอก PIN 6 หลักให้ครบ'
    loading.value = false
    return
  }

  try {
    // Demo Mode: ลองเรียก API ก่อน (timeout สั้น: 1 วินาที)
    try {
      const response = await Promise.race([
        axios.post(API_URL, { pin: pin.value }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000))
      ])

      if (response.data &&
        response.data.success === true &&
        response.data.token &&
        response.data.user &&
        response.data.user.name) {

        // 1. บันทึกสถานะ Login
        localStorage.setItem('loggedIn', 'yes')
        // 2. บันทึก Token
        localStorage.setItem('authToken', response.data.token)
        // 3. บันทึกชื่อ
        localStorage.setItem('userName', response.data.user.name)

        router.push('/chat')
        return
      } else {
        error.value = response.data.message || 'PIN ไม่ถูกต้อง'
      }
    } catch (apiError) {
      console.warn('API login failed/timeout, switching to Demo Mode:', apiError?.message)

      // Demo Mode: ตรวจสอบ PIN ค่าเดียวว่า "123456"
      if (pin.value === '123456') {

        // 1. บันทึกสถานะ Login
        localStorage.setItem('loggedIn', 'yes')
        // 2. บันทึก Demo Token
        localStorage.setItem('authToken', 'demo-token-' + Date.now())
        // 3. บันทึกชื่อ
        localStorage.setItem('userName', 'Demo User')

        router.push('/chat')
        return
      } else {
        error.value = 'PIN ไม่ถูกต้อง (Demo: ลอง 123456)'
      }
    }

  } catch (err) {
    console.error('Login Error:', err?.message)
    error.value = 'เกิดข้อผิดพลาด กรุณาลองใหม่'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
}
</style>
