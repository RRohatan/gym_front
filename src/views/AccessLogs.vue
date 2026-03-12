<template>
  <div class="page-layout">
    <div class="max-w-5xl mx-auto">

      <!-- Header -->
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Registro de Ingresos</h2>
          <p class="text-sm text-slate-400 mt-1">Historial de accesos al gimnasio</p>
        </div>
        <router-link :to="{ name: 'Menu' }" class="btn btn-secondary">Volver</router-link>
      </div>

      <!-- Filtros -->
      <div class="flex gap-3 mb-4">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por nombre o identificación..."
          class="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select v-model="filterMethod" class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todos los métodos</option>
          <option value="huella">Huella</option>
          <option value="cedula">Cédula</option>
        </select>
        <select v-model="filterStatus" class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todos los estados</option>
          <option value="permitido">Permitido</option>
          <option value="denegado">Denegado</option>
        </select>
      </div>

      <!-- Tabla -->
      <div class="bg-white rounded-2xl shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-5 py-3 text-left font-semibold text-gray-600">Miembro</th>
              <th class="px-5 py-3 text-left font-semibold text-gray-600">Identificación</th>
              <th class="px-5 py-3 text-left font-semibold text-gray-600">Método</th>
              <th class="px-5 py-3 text-left font-semibold text-gray-600">Estado</th>
              <th class="px-5 py-3 text-left font-semibold text-gray-600">Fecha y Hora</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="loading">
              <td colspan="5" class="text-center py-10 text-gray-400">Cargando...</td>
            </tr>
            <tr v-else-if="filtered.length === 0">
              <td colspan="5" class="text-center py-10 text-gray-400">No hay registros.</td>
            </tr>
            <tr v-for="log in filtered" :key="log.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-5 py-3 font-medium text-gray-900">{{ log.member?.name ?? '—' }}</td>
              <td class="px-5 py-3 text-gray-500">{{ log.member?.identification ?? '—' }}</td>
              <td class="px-5 py-3">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="log.method === 'huella' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'">
                  {{ log.method === 'huella' ? 'Huella' : 'Cédula' }}
                </span>
              </td>
              <td class="px-5 py-3">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="log.status === 'permitido' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                  <span class="w-1.5 h-1.5 rounded-full"
                    :class="log.status === 'permitido' ? 'bg-green-500' : 'bg-red-500'"></span>
                  {{ log.status === 'permitido' ? 'Permitido' : 'Denegado' }}
                </span>
              </td>
              <td class="px-5 py-3 text-gray-500">{{ formatDate(log.accessed_at) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Paginación -->
        <div v-if="meta && meta.last_page > 1" class="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p class="text-xs text-gray-400">
            Mostrando {{ meta.from }}–{{ meta.to }} de {{ meta.total }} registros
          </p>
          <div class="flex gap-2">
            <button @click="changePage(meta.current_page - 1)" :disabled="meta.current_page === 1"
              class="px-3 py-1 rounded text-sm border border-gray-300 disabled:opacity-40 hover:bg-gray-50">
              Anterior
            </button>
            <button @click="changePage(meta.current_page + 1)" :disabled="meta.current_page === meta.last_page"
              class="px-3 py-1 rounded text-sm border border-gray-300 disabled:opacity-40 hover:bg-gray-50">
              Siguiente
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/axios'

const logs    = ref<any[]>([])
const meta    = ref<any>(null)
const loading = ref(true)
const search       = ref('')
const filterMethod = ref('')
const filterStatus = ref('')

const filtered = computed(() => {
  return logs.value.filter(log => {
    const name  = log.member?.name?.toLowerCase() ?? ''
    const id    = log.member?.identification?.toLowerCase() ?? ''
    const query = search.value.toLowerCase()

    const matchSearch = !query || name.includes(query) || id.includes(query)
    const matchMethod = !filterMethod.value || log.method === filterMethod.value
    const matchStatus = !filterStatus.value || log.status === filterStatus.value

    return matchSearch && matchMethod && matchStatus
  })
})

async function fetchLogs(page = 1) {
  loading.value = true
  try {
    const { data } = await api.get(`/access/logs?page=${page}`)
    logs.value = data.data
    meta.value = data.meta ?? { ...data, data: undefined }
  } finally {
    loading.value = false
  }
}

function changePage(page: number) {
  fetchLogs(page)
}

function formatDate(raw: string) {
  if (!raw) return '—'
  return new Date(raw).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
}

onMounted(() => fetchLogs())
</script>
