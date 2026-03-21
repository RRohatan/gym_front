<template>
  <div class="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">

    <!-- Logo / Nombre -->
    <div class="mb-10 text-center">
      <h1 class="text-3xl font-bold text-white tracking-wide">Control de Acceso</h1>
      <p class="text-gray-400 mt-1 text-sm">Coloca tu dedo en el lector para ingresar</p>
    </div>

    <!-- Panel central -->
    <div class="w-full max-w-sm bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6">

      <!-- Icono del lector -->
      <div
        class="w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500"
        :class="iconClass"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-14 h-14" viewBox="0 0 64 64" fill="none">
          <path d="M32 8C18.7 8 8 18.7 8 32s10.7 24 24 24 24-10.7 24-24S45.3 8 32 8z" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
          <path d="M22 32c0-5.5 4.5-10 10-10s10 4.5 10 10v8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
          <path d="M26 32v6M32 30v10M38 32v6" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>

      <!-- Mensaje de estado -->
      <p class="text-center text-lg font-medium" :class="textClass">
        {{ displayMessage }}
      </p>

      <!-- Info del miembro (si fue identificado) -->
      <div v-if="member" class="w-full bg-gray-700 rounded-xl p-4 text-center">
        <p class="text-white text-xl font-bold">{{ member.name }}</p>
        <p class="text-gray-400 text-sm mt-1">{{ member.identification }}</p>
        <!-- Fecha y hora del acceso -->
        <p v-if="state === 'success'" class="text-emerald-400 text-xs mt-2">
          Ingreso registrado: {{ accessTime }}
        </p>
      </div>

      <!-- Redirigiendo a pagos (membresía vencida) -->
      <div v-if="state === 'expired'" class="w-full bg-red-900/40 border border-red-500/40 rounded-xl p-3 text-center">
        <p class="text-red-300 text-sm font-medium">Redirigiendo a pagos...</p>
      </div>

      <!-- Botón escanear -->
      <button
        v-if="!scanning && state !== 'expired'"
        @click="manualRetry"
        class="w-full mt-2 py-3 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
      >
        {{ state === 'idle' && !member ? 'Escanear huella' : 'Escanear de nuevo' }}
      </button>
    </div>

    <!-- Indicador de conexión con el bridge -->
    <p class="mt-6 text-xs flex items-center gap-1.5" :class="connected ? 'text-green-400' : 'text-red-400'">
      <span class="w-2 h-2 rounded-full" :class="connected ? 'bg-green-400' : 'bg-red-400'"></span>
      {{ connected ? 'Lector conectado' : 'Lector desconectado' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFingerprint } from '@/composables/useFingerprint'

const route  = useRoute()
const router = useRouter()
const { connected, busy, statusMsg, identify } = useFingerprint()

// El gimnasio_id viene por query param: /kiosko?gimnasio=1
const gimnasioId = computed(() => Number(route.query.gimnasio) || null)

type State = 'idle' | 'scanning' | 'success' | 'expired' | 'unknown'

const state      = ref<State>('idle')
const member     = ref<any>(null)
const errMsg     = ref('')
const accessTime = ref('')
const scanning   = computed(() => state.value === 'scanning')

let resetTimer: ReturnType<typeof setTimeout> | null = null

function scheduleReset(delay: number) {
  if (resetTimer) clearTimeout(resetTimer)
  resetTimer = setTimeout(() => {
    state.value  = 'idle'
    member.value = null
  }, delay)
}

function manualRetry() {
  if (resetTimer) { clearTimeout(resetTimer); resetTimer = null }
  state.value  = 'idle'
  member.value = null
  startIdentify()
}

const iconClass = computed(() => ({
  'bg-blue-900 text-blue-300 animate-pulse': state.value === 'scanning',
  'bg-green-900 text-green-300':             state.value === 'success',
  'bg-red-900 text-red-300':                 state.value === 'expired' || state.value === 'unknown',
  'bg-gray-700 text-gray-400':               state.value === 'idle',
}))

const textClass = computed(() => ({
  'text-blue-300':  state.value === 'scanning',
  'text-green-300': state.value === 'success',
  'text-red-400':   state.value === 'expired' || state.value === 'unknown',
  'text-gray-300':  state.value === 'idle',
}))

const displayMessage = computed(() => {
  if (state.value === 'scanning') return statusMsg.value || 'Leyendo huella...'
  if (state.value === 'success')  return 'Acceso permitido'
  if (state.value === 'expired')  return 'Membresía vencida'
  if (state.value === 'unknown')  return errMsg.value || 'Huella no reconocida'
  return 'Listo para escanear'
})

const RESET_DELAY         = 3000  // ms mostrando resultado antes de volver a idle
const OVERHEAT_DELAY      = 15000 // ms de espera si el lector se calienta
const IDENTIFY_TIMEOUT_MS = 22000 // debe ser > timeout del bridge (20s)

async function startIdentify() {
  member.value = null
  errMsg.value = ''

  if (!gimnasioId.value) {
    state.value  = 'unknown'
    errMsg.value = 'Falta el parámetro ?gimnasio=ID en la URL.'
    return
  }

  state.value = 'scanning'

  try {
    const apiUrl = import.meta.env.VITE_API_URL as string
    const ev = await identify(gimnasioId.value, apiUrl)

    if (ev.event === 'identified') {
      if (ev.success) {
        // Acceso permitido — registrar fecha/hora y continuar
        state.value      = 'success'
        member.value     = ev.member
        accessTime.value = new Date().toLocaleString('es-CO', {
          dateStyle: 'short', timeStyle: 'short'
        })
        scheduleReset(RESET_DELAY)
        return

      } else if (ev.message?.toLowerCase().includes('vencida')) {
        // Membresía vencida — redirigir a pagos
        state.value  = 'expired'
        member.value = ev.member
        setTimeout(() => {
          router.push({ name: 'Payments' })
        }, 2500)
        return

      } else {
        state.value  = 'unknown'
        errMsg.value = ev.message
      }
    } else if (ev.event === 'error') {
      state.value  = 'unknown'
      errMsg.value = ev.message
    }
  } catch (err: any) {
    state.value  = 'unknown'
    errMsg.value = err.message
  }

  // Si se recalentó, mostrar mensaje especial
  const isOverheat = errMsg.value?.toLowerCase().includes('overheat') ||
                     errMsg.value?.toLowerCase().includes('overheating') ||
                     errMsg.value?.toLowerCase().includes('calor') ||
                     errMsg.value?.toLowerCase().includes('temperatura')

  if (isOverheat) errMsg.value = 'Lector en reposo por temperatura. Espera un momento...'

  scheduleReset(isOverheat ? OVERHEAT_DELAY : RESET_DELAY)
}

onMounted(() => {
  // La conexión con el lector se inicializa automáticamente dentro de useFingerprint
})
</script>
