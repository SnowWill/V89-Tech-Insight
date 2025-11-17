<template>
  <div class="pin-input" role="group" :aria-label="ariaLabel">
    <input
      v-for="(ch, idx) in boxes"
      :key="idx"
      :ref="(el) => setInputRef(el, idx)"
      :type="masked ? 'password' : 'text'"
      inputmode="numeric"
      pattern="[0-9]*"
      autocomplete="one-time-code"
      maxlength="1"
      class="pin-box"
      :aria-label="`${ariaLabel} ช่องที่ ${idx + 1}`"
      :disabled="disabled"
      :value="displayChar(idx)"
      @input="onInput(idx, $event)"
      @keydown="onKeyDown(idx, $event)"
      @paste.prevent="onPaste(idx, $event)"
    />
  </div>
  <p v-if="hint" class="pin-hint">{{ hint }}</p>
  <p v-if="error" class="pin-error">{{ error }}</p>
  
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  length: { type: Number, default: 6 },
  masked: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  autofocus: { type: Boolean, default: true },
  ariaLabel: { type: String, default: 'PIN' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'complete'])

const inputs = ref([])
const setInputRef = (el, idx) => {
  if (el) {
    inputs.value[idx] = el
  } else {
    // cleanup on unmount
    inputs.value[idx] = undefined
  }
}

const boxes = computed(() => Array.from({ length: props.length }))

function sanitizeDigits(str) {
  return (str || '').replace(/\D/g, '')
}

function updateValue(next) {
  const value = sanitizeDigits(next).slice(0, props.length)
  emit('update:modelValue', value)
  if (value.length === props.length) emit('complete', value)
}

function onInput(idx, e) {
  const val = sanitizeDigits(e.target.value)
  if (!val) {
    // cleared
    const current = props.modelValue.split('')
    current[idx] = ''
    updateValue(current.join(''))
    return
  }

  // Handle paste-like multi-char in one box
  if (val.length > 1) {
    fillFrom(idx, val)
    return
  }

  const current = props.modelValue.split('')
  current[idx] = val
  updateValue(current.join(''))
  focusNext(idx)
}

function onPaste(idx, e) {
  const text = sanitizeDigits((e.clipboardData || window.clipboardData).getData('text'))
  if (!text) return
  fillFrom(idx, text)
}

function fillFrom(start, text) {
  const current = props.modelValue.split('')
  for (let i = 0; i < text.length && start + i < props.length; i++) {
    current[start + i] = text[i]
  }
  updateValue(current.join(''))
  const endIndex = Math.min(start + text.length, props.length - 1)
  focusIndex(endIndex)
}

function onKeyDown(idx, e) {
  switch (e.key) {
    case 'Backspace': {
      const current = props.modelValue.split('')
      if (!current[idx]) {
        // move back if empty
        focusPrev(idx)
      } else {
        current[idx] = ''
        updateValue(current.join(''))
      }
      // prevent default to keep cursor behavior consistent
      e.preventDefault()
      break
    }
    case 'ArrowLeft':
      e.preventDefault();
      focusPrev(idx)
      break
    case 'ArrowRight':
      e.preventDefault();
      focusNext(idx)
      break
    case 'Tab':
    case 'Home':
    case 'End':
    case 'Delete':
      // allow default navigation keys
      break
    default: {
      // กดพิมพ์: อนุญาตเฉพาะตัวเลข 0-9 เท่านั้น และใส่ค่าลงกล่องทันที
      const key = e.key
      if (/^[0-9]$/.test(key)) {
        e.preventDefault()
        const current = props.modelValue.split('')
        current[idx] = key
        updateValue(current.join(''))
        focusNext(idx)
      } else {
        // non-digit -> บล็อคเลย ไม่ให้พิมพ์เข้า input
        e.preventDefault()
      }
      break
    }
  }
}

function focusIndex(i) {
  const el = inputs.value[i]
  if (el && typeof el.focus === 'function') {
    el.focus()
    // Place caret at end without selecting text to avoid black highlight
    try {
      const len = el.value?.length ?? 0
      if (typeof el.setSelectionRange === 'function') {
        el.setSelectionRange(len, len)
      }
    } catch (e) {
      // noop
    }
  }
}

function focusPrev(idx) {
  const target = Math.max(0, idx - 1)
  focusIndex(target)
}

function focusNext(idx) {
  if (idx < props.length - 1) {
    focusIndex(idx + 1)
  } else {
    focusIndex(idx)
  }
}

function displayChar(idx) {
  return props.modelValue[idx] || ''
}

onMounted(() => {
  if (props.autofocus && !props.disabled) {
    focusIndex(0)
  }
})

watch(
  () => props.length,
  () => {
    // If length changes, ensure value truncated
    updateValue(props.modelValue)
  }
)
</script>

<style scoped>
.pin-input {
  display: flex;
  gap: 10px;
}

.pin-box {
  width: 48px;
  height: 48px;
  text-align: center;
  font-size: 20px;
  border: 1px solid rgba(255,255,255,0.25);
  background: rgba(255,255,255,0.08);
  color: #fff;
  border-radius: 10px;
  outline: none;
  transition: box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}

.pin-box:focus {
  border-color: #3b82f6; /* blue-500 */
  box-shadow: 0 0 0 3px rgba(59,130,246,0.3);
  background: rgba(255,255,255,0.12);
}

.pin-box:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pin-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #cbd5e1; /* slate-300 */
}

.pin-error {
  margin-top: 6px;
  font-size: 12px;
  color: #fca5a5; /* red-300 */
}

@media (max-width: 420px) {
  .pin-box { width: 42px; height: 42px; font-size: 18px; }
}
</style>
