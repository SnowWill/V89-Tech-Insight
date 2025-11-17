<template>
  <div
    class="min-h-screen flex items-center justify-center
           bg-slate-100 dark:bg-[#0f172a]
           bg-gradient-to-br
           from-slate-200 to-slate-300
           dark:from-[#0f172a] dark:to-[#1e293b]">

    <div class="w-full max-w-3xl">

      <div class="glass rounded-3xl p-5 border border-black/10 dark:border-white/10 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
            V
          </div>
          <div>
            <h2 class="text-slate-800 dark:text-white text-xl font-semibold">Welcome, {{ userName }}</h2>
            <p class="text-slate-600 dark:text-gray-300 text-xs">ล็อกอินแล้ว</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
     <!-- ล้าง Session -->
     <button @click="requestClearSession"
                  class="p-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
                  title="ล้างประวัติใน Session นี้">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
              <path fill-rule="evenodd" d="M9 3.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75V5h3a.75.75 0 010 1.5h-.443l-1.07 12.305A2.25 2.25 0 0114.246 21H9.754a2.25 2.25 0 01-2.491-2.195L6.193 6.5H5.25a.75.75 0 010-1.5h3V3.75zM8.71 6.5h6.58l1.048 12.06a.75.75 0 01-.747.815H9.754a.75.75 0 01-.747-.815L8.71 6.5zM10.5 9.75a.75.75 0 011.5 0v7.5a.75.75 0 01-1.5 0v-7.5zM13.5 9.75a.75.75 0 011.5 0v7.5a.75.75 0 01-1.5 0v-7.5z" clip-rule="evenodd" />
            </svg>
          </button>
          <!-- ปุ่มตั้งค่า Facebook API (ไอคอน + Popup) -->
          <button @click="openFbModal"
                  class="p-2 rounded-xl bg-[#1877F2] hover:brightness-110 text-white"
                  title="แก้ไข Facebook API">
            <!-- Facebook gear icon -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
              <path d="M13.5 2.75a.75.75 0 00-.75.75v2.25h-1.5V3.5a.75.75 0 00-1.5 0v2.25H7.5a.75.75 0 000 1.5h2.25V9.5a.75.75 0 001.5 0V7.25h1.5V9.5a.75.75 0 001.5 0V7.25H18a.75.75 0 000-1.5h-2.25V3.5a.75.75 0 00-1.5 0v2.25h-1.5V3.5a.75.75 0 00-.75-.75z" />
            </svg>
          </button>
          <!-- ออกจากระบบ -->
          <button @click="logout"
                  class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white">
            ออกจากระบบ
          </button>
        </div>
      </div>

      <div class="glass mt-4 rounded-3xl border border-black/10 dark:border-white/10 overflow-hidden">
        <div ref="chatBox" class="h-[60vh] overflow-y-auto p-5 space-y-4">
          <div v-for="(m, i) in messages" :key="i" :class="['flex items-start gap-3', m.role === 'user' ? 'justify-end' : '']">
            <div v-if="m.role==='assistant'" class="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">V</div>
            <div v-else class="h-8 w-8 rounded-xl bg-gray-500 text-white flex items-center justify-center font-bold order-2">U</div>
            <div :class="['max-w-[75%] px-4 py-3 rounded-2xl border', m.role==='assistant' ? 'bg-white/60 text-slate-900 border-slate-200 dark:bg-white/10 dark:text-white dark:border-white/20' : 'bg-blue-600 text-white border-blue-700']">
              <!-- แสดงรูปภาพถ้ามี -->
              <div v-if="m.image" class="mb-2">
                <img :src="m.image" :alt="m.text" class="max-w-full h-auto rounded-lg max-h-64 object-cover" />
              </div>
              <div class="whitespace-pre-wrap">{{ formatDisplay(m.text) }}</div>
              <div class="text-xs opacity-50 mt-1">{{ m.time }}</div>
                <!-- Quick reply buttons / actions -->
                <div v-if="m.actions && m.actions.length" class="mt-3 flex gap-2 flex-wrap">
                  <button
                    v-for="(a, ai) in m.actions"
                    :key="ai"
                    @click="handleAction(m, a)"
                    class="px-3 py-1 rounded-full text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1"
                    :class="actionButtonClasses(a, m)"
                  >
                    {{ a.label }}
                  </button>
                </div>
            </div>
          </div>
          <div v-if="typing" class="flex items-start gap-3">
            <div class="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">V</div>
            <div class="max-w-[75%] px-4 py-3 rounded-2xl border bg-white/60 text-slate-900 border-slate-200 dark:bg-white/10 dark:text-white dark:border-white/20">
              <span class="inline-flex items-center gap-2">
                <span class="text-sm">กำลังพิมพ์</span>
                <span class="inline-flex">
                  <span class="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-.2s]"></span>
                  <span class="w-1.5 h-1.5 rounded-full bg-current animate-bounce mx-1"></span>
                  <span class="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:.2s]"></span>
                </span>
              </span>
            </div>
          </div>
        </div>
        <form @submit.prevent="send" class="p-5 border-t border-black/10 dark:border-white/10 flex items-center gap-3">
          <input
            v-model="draft"
            @input="enforceCharLimit"
            placeholder="พิมพ์ข้อความ..."
            class="flex-1 px-4 py-3 rounded-xl bg-white/60 border border-slate-300 text-slate-900 placeholder-slate-400 outline-none dark:bg-white/10 dark:border-white/20 dark:text-white dark:placeholder-gray-400"
          />
          <!-- ปุ่มอัปโหลดรูป -->
          <label class="p-2 rounded-xl bg-green-600 hover:bg-green-700 text-white cursor-pointer" title="อัปโหลดรูป">
            📷
            <input
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              class="hidden"
            />
          </label>
          <div
            class="text-xs select-none"
            :class="charCount >= maxChars ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-gray-400'"
            title="จำกัดไม่เกิน 1500 ตัวอักษร"
          >
            {{ charCount }}/{{ maxChars }} ตัวอักษร
          </div>
          <button :disabled="typing || !draft.trim()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white disabled:opacity-50">ส่ง</button>
        </form>
      </div>
    </div>
  </div>
  <!-- Modal: Facebook Settings -->
  <div v-if="showFbModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div class="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 p-5">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-white">ตั้งค่า Facebook API</h3>
        <button @click="closeFbModal" class="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white" title="ปิด">
          ✕
        </button>
      </div>

      <div class="space-y-3">
        <div>
          <label class="block text-sm text-slate-600 dark:text-gray-300 mb-1">Page ID</label>
          <input v-model="fbForm.pageId" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/20 bg-white dark:bg-white/10 text-slate-900 dark:text-white" placeholder="1234567890" />
        </div>
        <div>
          <label class="block text-sm text-slate-600 dark:text-gray-300 mb-1">Access Token</label>
          <input v-model="fbForm.accessToken" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/20 bg-white dark:bg-white/10 text-slate-900 dark:text-white" placeholder="EAAB..." />
        </div>
        <div>
          <label class="block text-sm text-slate-600 dark:text-gray-300 mb-1">Graph API Version</label>
          <div class="relative">
            <button type="button"
                    @click="showVersionMenu = !showVersionMenu"
                    class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/20 bg-white dark:bg-white/10 text-slate-900 dark:text-white flex justify-between items-center">
              <span>{{ fbForm.graphVersion }}</span>
              <span class="opacity-60">▾</span>
            </button>
            <ul v-if="showVersionMenu"
                class="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto rounded-lg border border-slate-300 dark:border-white/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow">
              <li v-for="v in graphVersions" :key="v">
                <button type="button"
                        @click="chooseVersion(v)"
                        class="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700">
                  {{ v }}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="mt-4 flex gap-2">
        <button @click="verifyFbSettings" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white">ตรวจสอบ</button>
        <button @click="saveFbSettings" class="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white">บันทึก</button>
      </div>

      <div v-if="fbStatus" class="mt-3 text-sm" :class="fbStatus.ok ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'">
        {{ fbStatus.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

/* -----------------------------
   State
----------------------------- */
const messages = ref([
  { role: 'assistant', text: 'สวัสดีครับ! ถามได้เลย 😊', time: now() }
])
const draft = ref('')
const chatBox = ref(null)
const typing = ref(false)
const userName = ref('user') // (ค่าเริ่มต้น)
// state สำหรับเสนอปุ่มโพสต์ Facebook หลังสร้างคอนเทนต์ FB
const pendingPostFacebook = ref(false)
// Modal state & form สำหรับตั้งค่า Facebook API
const showFbModal = ref(false)
const fbForm = ref({ pageId: '', accessToken: '', graphVersion: 'v23.0' })
const fbStatus = ref(null)
const graphVersions = ['v23.0','v22.0','v21.0','v20.0','v19.0','v18.0','v17.0','v16.0']
const showVersionMenu = ref(false)
// รอให้ผู้ใช้ระบุหัวข้อคอนเทนต์ก่อนค่อยสร้าง (ค่า: 'gen-fb' | 'gen-shortcaption' | null)
const awaitingContentKind = ref(null)

// จำกัดจำนวนตัวอักษรสูงสุด (1500 ตัวอักษร) แบบรองรับ grapheme cluster
const maxChars = 1500

function graphemeSegments(text) {
  try {
    const S = globalThis?.Intl?.Segmenter
    if (!S) return null
    const seg = new S('th', { granularity: 'grapheme' })
    return Array.from(seg.segment(text))
  } catch {
    return null
  }
}

function countGraphemes(text) {
  if (!text) return 0
  const segs = graphemeSegments(text)
  if (segs) return segs.length
  // fallback: นับด้วย code points
  return Array.from(text).length
}

const charCount = computed(() => countGraphemes(draft.value || ''))

function enforceCharLimit() {
  const text = draft.value || ''
  if (!text) return
  if (countGraphemes(text) <= maxChars) return

  const segs = graphemeSegments(text)
  if (segs) {
    // รวมจนถึงตัวอักษรที่ maxChars เพื่อรักษาขอบเขต grapheme
    const kept = segs.slice(0, maxChars)
    const last = kept[kept.length - 1]
    const endIndex = last.index + last.segment.length
    draft.value = text.slice(0, endIndex)
    return
  }
  // fallback: ตัดด้วย code points
  draft.value = Array.from(text).slice(0, maxChars).join('')
}

/* -----------------------------
   API Endpoints (ใช้ Proxy)
----------------------------- */
// โหมด Session (จะบันทึกลงชีตอัตโนมัติจากแบ็กเอนด์)
const SESSION_ID = 'demo1'
const SESSION_MESSAGE_URL = `/api/chat/ai-typhon/session/${SESSION_ID}/message`
const SESSION_HISTORY_URL = `/api/chat/ai-typhon/session/${SESSION_ID}/history`
const SESSION_DELETE_URL = `/api/chat/ai-typhon/session/${SESSION_ID}`
const AUTH_ME_URL = '/api/login/auth/me'

/* -----------------------------
   Lifecycle Hook (onMounted)
----------------------------- */
onMounted(() => {
  if (localStorage.getItem('loggedIn') !== 'yes') {
    router.push('/login');
    return;
  }

  // 💡 [อัปเดต]
  // 1. ดึงชื่อที่บันทึกไว้มาแสดงผลทันที (เพื่อความเร็ว)
  const savedName = localStorage.getItem('userName');
  if (savedName) {
    userName.value = savedName;
  }

  // 2. เรียก fetchUser() เพื่อยืนยัน Token และดึงชื่อล่าสุด
  // (ถ้า Token หมดอายุ, fetchUser() จะสั่ง Logout ให้อัตโนมัติ)
  fetchUser();
  // โหลดประวัติ Session มาแสดง (ถ้ามี)
  loadSessionHistory();
});

/* -----------------------------
   ดึงข้อมูลผู้ใช้ (ยืนยัน Token)
----------------------------- */
async function fetchUser() {
  const token = getToken();
  if (!token) {
    logout();
    return;
  }

  try {
    const response = await axios.get(AUTH_ME_URL, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    // (อัปเดตชื่อที่แสดงผล ด้วยข้อมูลล่าสุดจาก /auth/me)
    const latestName = response?.data?.user?.name
      || response?.data?.name
      || response?.data?.username
      || null

    if (latestName) {
      userName.value = latestName
      // (อัปเดต localStorage เผื่อชื่อมีการเปลี่ยนแปลง)
      localStorage.setItem('userName', latestName);
    } else {
      userName.value = 'User'
    }

  } catch (error) {
    // ถ้าได้ 401 -> Token หมดอายุ/ไม่ถูกต้อง ให้ Logout
    const status = error?.response?.status
    if (status === 401) {
      console.warn('Auth check returned 401 — logging out')
      logout()
      return
    }

    // ไม่ใช่ 401 (network error / CORS / API down): อย่า redirect ทันที
    // ใช้ชื่อจาก localStorage เป็น fallback เพื่อไม่ให้ผู้ใช้หลุดออก
    console.warn("Failed to fetch user (non-401). Falling back to saved/demo name:", error?.message)
    const savedName = localStorage.getItem('userName')
    userName.value = savedName || 'Demo User'
  }
}

/* -----------------------------
   ส่งข้อความ (Chat)
----------------------------- */
const send = () => {
  if (!draft.value.trim() || typing.value) return

  const q = draft.value
  messages.value.push({ role: 'user', text: q, time: now() })
  draft.value = ''

  nextTick(scroll)
  // ถ้าผู้ใช้พิมพ์คำว่า 'คอนเทน' และยังไม่ได้เลือกชนิดคอนเทนต์
  // ให้แสดงเฉพาะปุ่มตัวเลือก (ไม่ต้องเรียก AI ตอบ)
  const lowered = (q || '').toLowerCase()
  if (!awaitingContentKind.value && lowered.includes('คอนเทน')) {
    trySuggestContentActions(q)
    return
  }
  // ถ้าอยู่ในโหมดรอหัวข้อคอนเทนต์ ให้ใช้ข้อความนี้เป็นแหล่งเนื้อหา แล้วค่อยสร้างตามชนิดที่เลือก
  if (awaitingContentKind.value) {
    const kind = awaitingContentKind.value
    const prompt = buildContentPrompt(kind, q)
    // หลังจากได้หัวข้อแล้ว ออกจากโหมดรอหัวข้อ
    awaitingContentKind.value = null
    // ถ้าเป็นคอนเทนต์ Facebook เตรียมปุ่มโพสต์ต่อทันทีหลังได้ผลลัพธ์
    if (kind === 'gen-fb' || kind === 'gen-shortcaption') pendingPostFacebook.value = true
    // แทรกข้อความผู้ใช้ที่เป็นหัวข้อไปแล้ว จากนั้นให้ AI ตอบด้วย prompt ที่ประกอบขึ้น
    nextTick(scroll)
    respond(prompt)
    return
  }

  // โหมดปกติ: ส่งข้อความให้ AI ตอบตามเดิม
  respond(q)
}

/* Handle Image Upload */
function handleImageUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    const imageData = event.target?.result
    if (imageData) {
      // เพิ่มรูปให้ผู้ใช้ส่ง
      messages.value.push({
        role: 'user',
        text: '📷 [ส่งรูปภาพ]',
        image: imageData,
        time: now()
      })
      nextTick(scroll)

      // ให้ AI ตอบกลับ
      respond('ฉันส่งรูปภาพมาให้คุณดูครับ')
    }
  }
  reader.readAsDataURL(file)
}

/* -----------------------------
   ตอบข้อความ (Chat API)
----------------------------- */
async function respond(q) {
  typing.value = true
  const payload = {
    content: q,
    max_tokens: 1000,
    temperature: 0.7
  }

  try {
    const token = getToken()
    const response = await axios.post(
      SESSION_MESSAGE_URL,
      payload,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    )
    const ans = response?.data?.reply
      || response?.data?.raw?.choices?.[0]?.message?.content
      || response?.data?.raw?.output_text
      || response?.data?.raw?.text
      || '(no reply)'
    const assistantMsg = {
      role: 'assistant',
      text: ans,
      time: now()
    }
    if (pendingPostFacebook.value) {
      assistantMsg.actions = [
        { label: '📣 โพสต์ Facebook เลย', value: 'post-facebook' },
        { label: '📝 คัดลอกข้อความ', value: 'copy-text' },
        { label: '❌ ยกเลิก', value: 'cancel-post-facebook' },
      ]
      pendingPostFacebook.value = false
    }
    messages.value.push(assistantMsg)
    // ไม่ต้องเรียก logChat() เพราะแบ็กเอนด์บันทึกลง Sheet3 ให้อัตโนมัติใน session endpoint
  } catch (error) {
    console.error("API Error (Fallback to Demo):", error);
    const ans = generateDemoReply(q)
    messages.value.push({
      role: 'assistant',
      text: ans,
      time: now()
    })
    // โหมด Demo: บันทึกประวัติใน localStorage
    saveToLocalStorage()
  }
  typing.value = false
  nextTick(scroll)

  // ✅ Keyword trigger: ถ้าข้อความผู้ใช้มีคำว่า 'คอนเทน' ให้เสนอชุดตัวเลือกช่วยสร้างคอนเทนต์
  trySuggestContentActions(q)
}

/* -----------------------------
   Helper
----------------------------- */

// ล้าง Session และรีเซ็ตข้อความบนจอ
async function clearSession() {
  const token = getToken()

  try {
    if (token) {
      // พยายามลบจาก API ถ้ามี
      try {
        await axios.delete(SESSION_DELETE_URL, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } catch (apiError) {
        console.warn('API clearSession failed (Demo Mode):', apiError?.message)
      }
    }
  } catch (e) {
    console.warn('clearSession error:', e?.message)
  }

  // Demo Mode: รีเซ็ต UI เสมอ
  await resetChatUI()
}

// แสดงข้อความยืนยันในห้องแชท พร้อมปุ่มตอบแบบ quick reply
function requestClearSession() {
  // ถ้ามีคำถามยืนยันค้างอยู่แล้ว ไม่ต้องเพิ่มซ้ำ
  const exists = messages.value.some(m => Array.isArray(m.actions) && m.actions.some(a => a.value === 'confirm-delete-session'))
  if (exists) return
  messages.value.push({
    role: 'assistant',
    text: 'ต้องการล้างประวัติแชทของห้องนี้หรือไม่?',
    time: now(),
    actions: [
      { label: '✅ ลบเลย', value: 'confirm-delete-session' },
      { label: '❌ ยกเลิก', value: 'cancel-delete-session' },
    ]
  })
  nextTick(scroll)
}

// จัดการการกดปุ่มตอบแบบ quick reply
async function handleAction(message, action) {
  if (!action || !action.value) return
  // ลบปุ่มออกจากข้อความเดิม (กันกดซ้ำ)
  message.actions = []
  if (action.value === 'confirm-delete-session') {
    await clearSession()
  } else if (action.value === 'cancel-delete-session') {
    messages.value.push({ role: 'assistant', text: 'ยกเลิกการล้างประวัติแล้ว', time: now() })
    await nextTick()
    scroll()
  } else if (action.value.startsWith('gen-')) {
    // เข้าสู่โหมดรอหัวข้อคอนเทนต์: ให้ผู้ใช้พิมพ์หัวข้อ/รายละเอียดก่อน แล้วค่อยสร้าง
    awaitingContentKind.value = action.value
    messages.value.push({
      role: 'assistant',
      text: 'ระบุหัวข้อ/รายละเอียดคอนเทนต์ที่ต้องการ แล้วกดส่งนะครับ',
      time: now()
    })
    await nextTick(); scroll();
  } else if (action.value === 'post-facebook') {
    await postFacebook(message?.text || '')
  } else if (action.value === 'cancel-post-facebook') {
    messages.value.push({ role: 'assistant', text: 'ยกเลิกการโพสต์ไปยัง Facebook แล้ว', time: now() })
    await nextTick(); scroll();
  } else if (action.value === 'copy-text') {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(String(message?.text || ''))
        messages.value.push({ role: 'assistant', text: 'คัดลอกข้อความแล้ว 📋', time: now() })
      } else {
        messages.value.push({ role: 'assistant', text: 'เบราว์เซอร์ไม่รองรับการคัดลอกอัตโนมัติ', time: now() })
      }
      await nextTick(); scroll();
    } catch {
      messages.value.push({ role: 'assistant', text: 'คัดลอกไม่สำเร็จ', time: now() })
      await nextTick(); scroll();
    }
  }
}
function now() {
  return new Date().toLocaleTimeString('th-TH')
}
function scroll() {
  if (chatBox.value) {
    chatBox.value.scrollTop = chatBox.value.scrollHeight
  }
}

// กำหนดคลาสสีของปุ่มตามประเภท action
function actionButtonClasses(a, m) {
  if (!a || !a.value) return 'bg-gray-400 text-white'
  switch (a.value) {
    case 'confirm-delete-session':
      return 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-400'
    case 'cancel-delete-session':
      return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400'
    case 'gen-fb':
      return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400'
    case 'gen-ig':
      return 'bg-pink-600 text-white hover:bg-pink-700 focus:ring-pink-400'
    case 'gen-tiktok':
      return 'bg-gray-800 text-white hover:bg-black focus:ring-gray-500'
    case 'gen-shortcaption':
      return 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-400'
    case 'post-facebook':
      return 'bg-[#1877F2] text-white hover:brightness-110 focus:ring-blue-300'
    case 'copy-text':
      return 'bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-400'
    default:
      // ปุ่มอื่น ๆ (ถ้ามีในอนาคต) ใช้โทนกลางตามบทบาท
      return m.role === 'assistant'
        ? 'bg-white/10 text-slate-800 dark:text-white hover:bg-white/20 border border-slate-300/30'
        : 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-700'
  }
}

// Generate Demo AI Reply
function generateDemoReply(userMessage) {
  const msg = userMessage.toLowerCase()

  // ตรวจจับคำหลัก
  if (msg.includes('สวัสดี') || msg.includes('hello') || msg.includes('hi')) {
    return 'สวัสดีครับ! ยินดีต้อนรับ 😊 มีอะไรให้ช่วยเหลือไหมครับ?'
  }
  if (msg.includes('ขอบคุณ') || msg.includes('thanks') || msg.includes('ありがとう')) {
    return 'ไม่เป็นไรครับ! ยินดีให้บริการ 🙏'
  }
  if (msg.includes('คุณชื่ออะไร') || msg.includes('who are you') || msg.includes('ชื่อ')) {
    return 'ผมชื่อ ChatBot N8N ครับ! ยินดีที่ได้รู้จัก 🤖'
  }
  if (msg.includes('วันนี้สัตริยะ') || msg.includes('weather') || msg.includes('อากาศ')) {
    return 'วันนี้อากาศดีเลยครับ! ☀️ (ข้อมูลสาธารณะ: Demo Mode)'
  }
  if (msg.includes('เวลา') || msg.includes('time') || msg.includes('กี่โมง')) {
    return `เวลาตอนนี้ ${new Date().toLocaleTimeString('th-TH')} ครับ ⏰`
  }
  if (msg.includes('วันที่') || msg.includes('date')) {
    return `วันที่ ${new Date().toLocaleDateString('th-TH')} ครับ 📅`
  }
  if (msg.includes('ช่วย') || msg.includes('help')) {
    return 'ข้อโทษครับ นี่คือ Demo Mode ผมสามารถช่วยได้เพียงแค่สนทนาธรรมชาติเท่านั้น 📬'
  }
  if (msg.includes('ด้วย') || msg.includes('with')) {
    return 'ตกลงครับ สิ่งใดกี่ตัวตั้งแต่นั้น! 👏'
  }

  // คำตอบทั่วไป
  const genericReplies = [
    'เข้าใจแล้วครับ! 👍',
    'ใช่ครับ เหมือนดีด้วย ✨',
    'น่าสนใจครับ! 🤔',
    'ขอบคุณที่บอกนะครับ 😊',
    'ยอดเยี่ยมครับ! 🌟',
    'ผมเข้าใจแล้ว เข้าใจแล้ว 💡',
    'คุณพูดถูกครับ! 👌'
  ]

  return genericReplies[Math.floor(Math.random() * genericReplies.length)]
}

// -----------------------------
// Content suggestion helpers
// -----------------------------
function buildContentPrompt(kind, source) {
  const base = source || 'หัวข้อที่ผู้ใช้ให้มา'
  switch (kind) {
    case 'gen-fb':
      return `ช่วยสร้างโพสต์ Facebook ที่กระชับและน่าสนใจ (มี emoji เล็กน้อย) จากเนื้อหา: ${base}`
    case 'gen-shortcaption':
      return `สร้างแคปชั่นสั้นๆ 5 แบบ (ไม่เกิน 60 ตัวอักษร) จากเนื้อหา: ${base}`
    default:
      return ''
  }
}

function trySuggestContentActions(userText) {
  if (!userText) return
  // ตรวจคำว่า 'คอนเทน' (ไม่สนตัวพิมพ์ใหญ่เล็ก)
  const lowered = userText.toLowerCase()
  if (!lowered.includes('คอนเทน')) return
  // กันซ้ำ: ถ้าข้อความสุดท้ายที่เป็น assistant มี actions เหล่านี้อยู่แล้ว ไม่เพิ่มซ้ำ
  const last = messages.value[messages.value.length - 1]
  if (last && Array.isArray(last.actions) && last.actions.some(a => a.value.startsWith('gen-'))) return
  messages.value.push({
    role: 'assistant',
    text: 'เลือกประเภทคอนเทนต์ แล้วพิมพ์หัวข้อ/รายละเอียดตามมาได้เลย:',
    time: now(),
    actions: [
      { label: '📰 โพสต์ Facebook', value: 'gen-fb' },
      { label: '✏️ แคปชั่นสั้น', value: 'gen-shortcaption' },
    ]
  })
  nextTick(scroll)
}

// เรียก backend เพื่อโพสต์ Facebook
async function postFacebook(text) {
  const msg = String(text || '').trim()
  if (!msg) return
  const token = getToken()
  if (!token) { logout(); return }
  try {
    const res = await axios.post('/apifb/api/facebook/post', { message: msg }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const id = res?.data?.result?.id || '(no id)'
    messages.value.push({ role: 'assistant', text: `โพสต์ขึ้น Facebook แล้ว: ${id}`, time: now() })
  } catch (e) {
    const msg = e?.response?.data?.error || e?.message || 'โพสต์ไม่สำเร็จ'
    messages.value.push({ role: 'assistant', text: `โพสต์ไม่สำเร็จ: ${msg}`, time: now() })
  }
  await nextTick(); scroll();
}

/* -----------------------------
   Facebook Settings Modal
----------------------------- */
function openFbModal() {
  showFbModal.value = true
  fbStatus.value = null
  loadFbSettings()
}
function closeFbModal() {
  showFbModal.value = false
  fbStatus.value = null
}
async function loadFbSettings() {
  const token = getToken()
  if (!token) { logout(); return }
  try {
  const res = await axios.get('/apifb/api/facebook/token', { headers: { Authorization: `Bearer ${token}` } })
    fbForm.value.pageId = res?.data?.pageId || ''
    fbForm.value.graphVersion = res?.data?.graphVersion || fbForm.value.graphVersion
  } catch (e) {
    fbStatus.value = { ok: false, message: e?.response?.data?.error || e?.message || 'โหลดค่าไม่สำเร็จ' }
  }
}
async function verifyFbSettings() {
  fbStatus.value = null
  const token = getToken()
  if (!token) { logout(); return }
  try {
    const res = await axios.post('/apifb/api/facebook/verify', {
      pageId: fbForm.value.pageId,
      accessToken: fbForm.value.accessToken || undefined,
      graphVersion: fbForm.value.graphVersion
    }, { headers: { Authorization: `Bearer ${token}` } })
    const used = res?.data?.used || {}
    fbStatus.value = { ok: true, message: `ตรวจสอบสำเร็จ (Page: ${used.pageId || fbForm.value.pageId}, Version: ${res?.data?.graphVersion || fbForm.value.graphVersion})` }
  } catch (e) {
    const errData = e?.response?.data
    const details = errData?.details
    const code = details?.error?.code
    const type = details?.error?.type
    const status = details?.status
    const rawMsg = (typeof errData?.error === 'string' ? errData?.error : '') || details?.error?.message || e?.message || 'unknown error'
    const ver = details?.graphVersion || fbForm.value.graphVersion
    const usedPage = details?.used?.pageId || fbForm.value.pageId
    // Friendly mapping for common Graph errors
    let friendly = rawMsg
    if (status === 400 && String(type).includes('GraphMethodException') && /Object with ID/i.test(String(rawMsg)) ) {
      friendly = 'Page ID ไม่ถูกต้อง'
    }
    const compact = [`ตรวจสอบล้มเหลว`, status ? `HTTP ${status}` : null, code ? `CODE ${code}` : null, type ? `TYPE ${type}` : null].filter(Boolean).join(' | ')
    fbStatus.value = { ok: false, message: `${compact}: ${friendly} (Page: ${usedPage}, Version: ${ver})` }
  }
}
function chooseVersion(v) {
  fbForm.value.graphVersion = v
  showVersionMenu.value = false
}
async function saveFbSettings() {
  fbStatus.value = null
  const token = getToken()
  if (!token) { logout(); return }
  try {
    await axios.patch('/apifb/api/facebook/token', {
      pageId: fbForm.value.pageId,
      graphVersion: fbForm.value.graphVersion
    }, { headers: { Authorization: `Bearer ${token}` } })
    fbStatus.value = { ok: true, message: 'บันทึกสำเร็จ' }
    // ปิด popup อัตโนมัติหลังบันทึกสำเร็จ
    showFbModal.value = false
  } catch (e) {
    fbStatus.value = { ok: false, message: e?.response?.data?.error || e?.message || 'บันทึกไม่สำเร็จ' }
  }
}

// รีเซ็ต UI ห้องแชทและช่องพิมพ์หลังจากล้าง Session สำเร็จ
async function resetChatUI() {
  messages.value = [
    { role: 'assistant', text: 'ล้างประวัติแชทของห้องนี้แล้ว เริ่มคุยใหม่ได้เลย 😊', time: now() }
  ]
  draft.value = ''
  typing.value = false
  await nextTick()
  scroll()
}

// แสดงผล: ตัดบรรทัดไม่เกิน N ตัวอักษรต่อบรรทัด (default 50)
const displayLineChars = 50
function formatDisplay(text) {
  if (!text) return ''
  const lines = String(text).split(/\r?\n/)
  const wrapped = []
  for (const line of lines) {
    const segs = graphemeSegments(line) || Array.from(line)
    if (!segs.length) { wrapped.push(''); continue }
    for (let i = 0; i < segs.length; i += displayLineChars) {
      const slice = segs.slice(i, i + displayLineChars)
      if (slice.length === 0) continue
      if (Array.isArray(slice[0]) || typeof slice[0] === 'object') {
        // เมื่อใช้ Intl.Segmenter จะได้ object { segment, index, ... }
        wrapped.push(slice.map(s => s.segment).join(''))
      } else {
        // fallback: array ของตัวอักษร
        wrapped.push(slice.join(''))
      }
    }
  }
  return wrapped.join('\n')
}

// Helper: ดึงโทเคนจาก localStorage หลายคีย์ที่อาจใช้
function getToken() {
  return (
    localStorage.getItem('authToken') ||
    localStorage.getItem('token') ||
    ''
  )
}

/* Save Chat to LocalStorage */
function saveToLocalStorage() {
  try {
    const chatData = messages.value.map(m => ({
      role: m.role,
      content: m.text,
      time: m.time
    }))
    localStorage.setItem('demoChatHistory', JSON.stringify(chatData))
  } catch (e) {
    console.warn('Failed to save chat history:', e?.message)
  }
}

// ดึงประวัติจาก Session (หรือ localStorage ใน Demo Mode)
async function loadSessionHistory() {
  const token = getToken()
  if (!token) return

  try {
    // พยายามโหลดจาก API ถ้ามี
    try {
      const response = await axios.get(SESSION_HISTORY_URL, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const history = response?.data?.messages || []
      const mapped = history
        .filter(m => m && m.role && typeof m.content === 'string')
        .map(m => ({ role: m.role, text: m.content, time: now() }))

      messages.value = [messages.value[0], ...mapped]
      await nextTick()
      scroll()
      return
    } catch (apiError) {
      console.warn('API loadSessionHistory failed (Demo Mode):', apiError?.message)
    }
  } catch (e) {
    console.warn('loadSessionHistory error:', e?.message)
  }

  // Demo Mode: โหลดจาก localStorage
  const savedHistory = localStorage.getItem('demoChatHistory')
  if (savedHistory) {
    try {
      const history = JSON.parse(savedHistory)
      messages.value = [messages.value[0], ...history]
      await nextTick()
      scroll()
    } catch (e) {
      console.warn('Failed to parse chat history:', e?.message)
    }
  }
}

/* -----------------------------
   Logout (อัปเดต)
----------------------------- */
function logout() {
  // 💡 [อัปเดต] ล้างข้อมูลทั้งหมด
  localStorage.removeItem('loggedIn')
  localStorage.removeItem('authToken')
  localStorage.removeItem('userName') // 👈 ล้างชื่อด้วย
  router.push('/login')
}

/* Navigation */
</script>

<style scoped>
.glass {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(16px);
}
.dark .glass {
  background: rgba(255, 255, 255, 0.05);
}
.chat::-webkit-scrollbar { width: 10px; }
.chat::-webkit-scrollbar-thumb { background: rgba(148,163,184,.5); border-radius: 999px; }
</style>
