<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-slate-100 dark:bg-[#0f172a] bg-gradient-to-br from-indigo-100 via-purple-50 to-teal-50 dark:from-[#0f172a] dark:via-[#1e1e2e] dark:to-[#172033] transition-colors duration-500 font-sans">

    <div class="w-full max-w-4xl flex flex-col h-[85vh] shadow-2xl rounded-3xl overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700">

      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white/50 dark:bg-slate-800/50">
        <div class="flex items-center gap-3">
          <div class="relative">
            <div class="h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/30">
              AI
            </div>
            <span class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 bg-emerald-500"></span>
          </div>
          <div>
            <h2 class="text-slate-800 dark:text-white text-lg font-bold tracking-tight">n8n AI Assistant</h2>
            <p class="text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center gap-1">
              {{ typing ? 'กำลังพิมพ์...' : 'พร้อมใช้งาน' }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button @click="showSettings = true" class="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-all" title="ตั้งค่า">⚙️</button>
          <div class="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>
          <button @click="clearChat" class="p-2.5 rounded-xl text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-slate-700 transition-all" title="ล้างแชท">🗑</button>
          <button @click="logout" class="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-slate-700 transition-all" title="ออกจากระบบ">🚪</button>
        </div>
      </div>

      <div class="flex-1 overflow-hidden relative bg-slate-50/50 dark:bg-[#0b1120]/50">
        <div ref="chatBox" class="h-full overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar">

          <div v-for="m in messages" :key="m.id" class="animate-fade-in-up group flex w-full" :class="m.role === 'user' ? 'justify-end' : 'justify-start'">
            <div v-if="m.role==='assistant'" class="mr-3 flex-shrink-0 self-end">
              <div class="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center text-xs font-bold shadow-md">AI</div>
            </div>

            <div :class="['max-w-[85%] lg:max-w-[75%] rounded-2xl shadow-sm px-5 py-3.5 relative transition-all', m.role === 'assistant' ? 'bg-white text-slate-800 rounded-bl-none border border-slate-100 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700' : 'bg-blue-600 text-white rounded-br-none shadow-blue-500/20']">

              <div v-if="m.image" class="mb-3 overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
                <img :src="m.image" class="max-w-full h-auto max-h-80 object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" @click="openImage(m.image)"/>
              </div>

              <div class="prose prose-sm max-w-none dark:prose-invert leading-relaxed whitespace-pre-wrap break-words" v-html="renderMessage(m.text)"></div>

              <div :class="['text-[10px] mt-1 text-right font-medium', m.role==='assistant' ? 'text-slate-400' : 'text-blue-100/80']">{{ m.time }}</div>
            </div>
          </div>

          <div v-if="typing" class="flex justify-start animate-fade-in-up">
            <div class="mr-3 flex-shrink-0 self-end">
              <div class="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center text-xs font-bold">AI</div>
            </div>
            <div class="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-none border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
              <span class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
              <span class="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></span>
              <span class="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 z-20">
        <div v-if="pendingImage" class="mb-3 flex items-start gap-3 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-blue-200 dark:border-blue-900 animate-fade-in-up">
          <div class="relative group">
            <img :src="pendingImage" class="h-20 w-20 object-cover rounded-lg shadow-sm border border-slate-200 dark:border-slate-700" />
            <button @click="removeImage" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-transform hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div class="text-xs text-slate-500 mt-1">
            <p class="font-semibold text-slate-700 dark:text-slate-300">แนบรูปภาพแล้ว</p>
            <p>พร้อมส่งไปให้ AI วิเคราะห์</p>
          </div>
        </div>

        <form @submit.prevent="sendMessage" class="relative flex items-end gap-2">
          <label class="flex-shrink-0 p-3 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-blue-400 transition-colors cursor-pointer" title="อัปโหลดรูป">
            <input ref="imageInput" type="file" accept="image/*" class="hidden" @change="handleImageSelect" />
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          </label>
          <textarea
            v-model="draft"
            @keydown.enter.exact.prevent="sendMessage"
            @input="autoResize"
            ref="textArea"
            rows="1"
            placeholder="พิมพ์ข้อความ... (พิมพ์ 'โพสต์' เพื่อเริ่มโพสต์ Facebook)"
            class="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border-0 focus:ring-2 focus:ring-blue-500 resize-none max-h-32 custom-scrollbar placeholder:text-slate-400 shadow-inner"
          ></textarea>
          <button type="submit" :disabled="typing || (!draft.trim() && !pendingImage)" class="flex-shrink-0 p-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-600/40 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 transform active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>
    </div>

    <div v-if="showSettings" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" @click.self="showSettings = false">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-100 dark:border-slate-700">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4">ตั้งค่าการเชื่อมต่อ</h3>
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">n8n Webhook URL (POST)</label>
          <input v-model="webhookUrl" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
        </div>
        <div class="flex justify-end gap-2">
          <button @click="showSettings = false" class="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">ยกเลิก</button>
          <button @click="saveSettings" class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md">บันทึก</button>
        </div>
      </div>
    </div>

    <div v-if="showPostModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" @click.self="showPostModal = false">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg border border-slate-100 dark:border-slate-700 relative overflow-hidden">

        <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500"></div>

        <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
          <span class="text-2xl">🚀</span> AI Auto-Post
        </h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">AI จะช่วยเขียนแคปชั่นและโพสต์ลง Facebook ให้ทันที</p>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">หัวข้อที่ต้องการโพสต์ (Topic)</label>
            <input
              v-model="postTopic"
              placeholder="เช่น ประโยชน์ของ AI, โปรโมชั่นร้านกาแฟ..."
              class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              @keyup.enter="handlePostSubmit"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex justify-between">
              Facebook Page Access Token
              <a href="https://drive.google.com/drive/folders/1tWrW3VbO6Q49B_ljYIZ35x_ve5argf4t?usp=sharing" target="_blank" class="text-xs text-blue-500 hover:underline">รับ Token ที่นี่</a>
            </label>
            <input
              v-model="fbToken"
              type="password"
              placeholder="EAAB..."
              class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-sm"
            />
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-8">
          <button @click="showPostModal = false" class="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 font-medium transition-colors">ยกเลิก</button>
          <button
            @click="handlePostSubmit"
            :disabled="!postTopic || !fbToken"
            class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all flex items-center gap-2"
          >
            <span>✨ สร้างและโพสต์</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// ถ้าลง npm install marked dompurify แล้ว ให้ uncomment 2 บรรทัดล่างนี้
// import { marked } from 'marked'
// import DOMPurify from 'dompurify'

const router = useRouter()

// --- Configuration ---
const DEFAULT_N8N_URL = 'http://localhost:5678/webhook/3ea4dd57-2ebf-46dd-9e1b-7e2bf41d936d/chat'
const SESSION_KEY = 'n8n_chat_session_id'
const HISTORY_KEY = 'n8n_chat_history'

// --- State ---
const messages = ref([])
const draft = ref('')
const typing = ref(false)
const chatBox = ref(null)
const textArea = ref(null)
const imageInput = ref(null)
const pendingImage = ref(null)
const showSettings = ref(false)
const webhookUrl = ref(localStorage.getItem('n8nWebhookUrl') || DEFAULT_N8N_URL)

// Post Modal State
const showPostModal = ref(false)
const postTopic = ref('')
const fbToken = ref('')

// --- Initialization ---
let sessionId = localStorage.getItem(SESSION_KEY)
if (!sessionId) {
  sessionId = 'sess-' + Math.random().toString(36).substring(2) + Date.now().toString(36)
  localStorage.setItem(SESSION_KEY, sessionId)
}

onMounted(() => {
  const savedHistory = localStorage.getItem(HISTORY_KEY)
  if (savedHistory) {
    try { messages.value = JSON.parse(savedHistory) } catch (e) {}
  }

  if (messages.value.length === 0) {
    messages.value.push({
      id: Date.now(),
      role: 'assistant',
      text: 'สวัสดีครับ! ผมพร้อมช่วยงานแล้ว 🤖\n(พิมพ์คำว่า **"โพสต์"** เพื่อสั่งงานโพสต์ Facebook ได้เลยครับ)',
      time: getTime()
    })
  }
  scrollToBottom()
})

watch(messages, (newMessages) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(newMessages))
}, { deep: true })

// --- Helpers ---
const getTime = () => new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })

const scrollToBottom = () => {
  nextTick(() => {
    if (chatBox.value) chatBox.value.scrollTo({ top: chatBox.value.scrollHeight, behavior: 'smooth' })
  })
}

const autoResize = () => {
  const el = textArea.value
  if (el) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 128) + 'px'
  }
}

const saveSettings = () => {
  localStorage.setItem('n8nWebhookUrl', webhookUrl.value)
  showSettings.value = false
}

const clearChat = () => {
  if(!confirm('ต้องการล้างประวัติการแชททั้งหมด?')) return
  messages.value = [{ role: 'assistant', text: 'ล้างหน้าจอเรียบร้อย เริ่มใหม่ได้เลยครับ ✨', time: getTime() }]
  localStorage.removeItem(HISTORY_KEY)
  sessionId = 'sess-' + Math.random().toString(36).substring(2) + Date.now().toString(36)
  localStorage.setItem(SESSION_KEY, sessionId)
}

const logout = () => {
  localStorage.removeItem('loggedIn')
  router.push('/login')
}

// --- Formatting ---
const renderMessage = (text) => {
  if (!text) return ''

  // ถ้ามี marked/dompurify
  // return DOMPurify.sanitize(marked.parse(text))

  // Fallback: Basic formatting (อนุญาต Link <a href>)
  // 1. Escape HTML chars (ยกเว้นแท็กที่เราจะอนุญาตทีหลัง)
  let safeText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  // 2. Convert Newlines to <br>
  safeText = safeText.replace(/\n/g, '<br>')

  // 3. Bold (**...**) -> <b>...</b>
  safeText = safeText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')

  // 4. Auto-link URLs (แปลง http/https เป็น <a>)
  const urlRegex = /(https?:\/\/[^\s<]+)/g
  safeText = safeText.replace(urlRegex, '<a href="$1" target="_blank" class="text-blue-500 hover:underline break-all">$1</a>')

  return safeText
}

// --- Image Handling ---
const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(',')
  const mimeMatch = arr[0].match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) u8arr[n] = bstr.charCodeAt(n)
  return new File([u8arr], filename, { type: mime })
}

const handleImageSelect = (e) => {
  const file = e.target.files?.[0]
  if (!file || file.size > 5 * 1024 * 1024) {
    alert('ไฟล์ใหญ่เกิน 5MB')
    return
  }
  const reader = new FileReader()
  reader.onload = (evt) => {
    pendingImage.value = evt.target.result
    e.target.value = ''
    scrollToBottom()
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  pendingImage.value = null
  if(imageInput.value) imageInput.value.value = ''
}

const openImage = (url) => window.open(url, '_blank')

// --- Special Action: Facebook Post ---
const handlePostSubmit = async () => {
  if (!postTopic.value || !fbToken.value) return
  const topic = postTopic.value
  const token = fbToken.value

  showPostModal.value = false
  postTopic.value = ''
  // fbToken.value = '' // ถ้าอยากให้จำ Token ไว้ไม่ต้องล้างบรรทัดนี้

  messages.value.push({
    id: Date.now(),
    role: 'user',
    text: `🚀 กำลังดำเนินการสร้างและโพสต์...\nหัวข้อ: "${topic}"`,
    time: getTime()
  })

  typing.value = true
  scrollToBottom()

  try {
    const form = new FormData()
    form.append('mode', 'facebook_post') // *** ตัวบอก n8n ว่านี่คือโหมดโพสต์ ***
    form.append('topic', topic)
    form.append('fb_token', token)
    form.append('sessionId', sessionId)

    const res = await axios.post(webhookUrl.value, form)
    handleResponse(res.data)
  } catch (err) {
    handleError(err)
  }
}

// --- Core Chat Logic ---
const sendMessage = async () => {
  // 1. ตรวจจับคำว่า "โพสต์"
  if (draft.value.trim() === 'โพสต์') {
    draft.value = ''
    showPostModal.value = true
    autoResize()
    return
  }

  // 2. ตรวจสอบข้อความปกติ
  if (!draft.value.trim() && !pendingImage.value) return
  if (typing.value) return

  const textContent = draft.value
  const imageContent = pendingImage.value

  draft.value = ''
  pendingImage.value = null
  if (textArea.value) textArea.value.style.height = 'auto'

  messages.value.push({
    id: Date.now(),
    role: 'user',
    text: textContent,
    image: imageContent,
    time: getTime()
  })

  scrollToBottom()
  typing.value = true

  try {
    const form = new FormData()
    form.append('chatInput', textContent)
    form.append('sessionId', sessionId)
    if (imageContent) form.append('file', dataURLtoFile(imageContent, 'image.jpg'))

    const res = await axios.post(webhookUrl.value, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    handleResponse(res.data)
  } catch (err) {
    handleError(err)
  }
}

const handleResponse = (data) => {
  let aiReply = ''
  // พยายามหาข้อความตอบกลับจาก n8n
  if (typeof data === 'string') aiReply = data
  else if (typeof data === 'object') {
    // ถ้า n8n ส่งกลับมาเป็น JSON { text: "..." } หรือ { output: "..." }
    aiReply = data.output || data.text || data.response || data.message || JSON.stringify(data, null, 2)
  }

  if (!aiReply) aiReply = '✅ ได้รับข้อมูลแล้ว (ไม่มีข้อความตอบกลับ)'

  messages.value.push({
    id: Date.now() + 1,
    role: 'assistant',
    text: aiReply,
    time: getTime()
  })
  typing.value = false
  scrollToBottom()
}

const handleError = (err) => {
  console.error(err)
  let msg = err.message
  if (err.response && err.response.status === 404) msg = 'ไม่พบ Webhook URL (404)'
  messages.value.push({
    id: Date.now() + 1,
    role: 'assistant',
    text: `⚠️ Error: ${msg}\nกรุณาตรวจสอบการตั้งค่า Webhook`,
    time: getTime()
  })
  typing.value = false
  scrollToBottom()
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; border: 2px solid transparent; background-clip: content-box; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #475569; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #64748b; }

.animate-fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
