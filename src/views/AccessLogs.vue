<template>
  <div class="page-layout">
    <div class="max-w-5xl mx-auto">
      <BaseCard title="Registro de Ingresos" subtitle="Historial de accesos al gimnasio" class="space-y-4">
        <template #actions>
          <router-link :to="{ name: 'Menu' }" class="btn btn-secondary">Volver</router-link>
        </template>

        <div class="flex flex-col sm:flex-row gap-3">
          <BaseInput
            v-model="search"
            type="text"
            placeholder="Buscar por nombre o identificación..."
            class="flex-1"
          />
          <BaseSelect
            v-model="filterMethod"
            :options="methodOptions"
          />
          <BaseSelect
            v-model="filterStatus"
            :options="statusOptions"
          />
        </div>

        <div class="table-wrap">
          <table class="min-w-full text-sm">
            <thead class="table-head">
              <tr>
                <th>Miembro</th>
                <th>Identificación</th>
                <th>Método</th>
                <th>Estado</th>
                <th>Fecha y Hora</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="5" class="text-center py-10 text-gray-400">Cargando...</td>
              </tr>
              <tr v-else-if="filtered.length === 0">
                <td colspan="5" class="text-center py-10 text-gray-400">No hay registros.</td>
              </tr>
              <tr v-for="log in filtered" :key="log.id" class="table-row">
                <td class="font-medium text-gray-900">{{ log.member?.name ?? '—' }}</td>
                <td class="text-gray-500">{{ log.member?.identification ?? '—' }}</td>
                <td>
                  <BaseBadge :color="log.method === 'huella' ? 'violet' : 'blue'">
                    {{ log.method === 'huella' ? 'Huella' : 'Cédula' }}
                  </BaseBadge>
                </td>
                <td>
                  <BaseBadge
                    :color="log.status === 'permitido' ? 'green' : 'red'"
                    dot
                  >
                    {{ log.status === 'permitido' ? 'Permitido' : 'Denegado' }}
                  </BaseBadge>
                </td>
                <td class="text-gray-500">{{ formatDate(log.accessed_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="meta && meta.last_page > 1"
          class="flex items-center justify-between text-sm text-gray-600"
        >
          <p class="text-xs text-gray-400">
            Mostrando {{ meta.from }}–{{ meta.to }} de {{ meta.total }} registros
          </p>
          <div class="flex gap-2">
            <BaseButton
              variant="secondary"
              size="sm"
              :disabled="meta.current_page === 1"
              @click="changePage(meta.current_page - 1)"
            >
              Anterior
            </BaseButton>
            <BaseButton
              variant="secondary"
              size="sm"
              :disabled="meta.current_page === meta.last_page"
              @click="changePage(meta.current_page + 1)"
            >
              Siguiente
            </BaseButton>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/axios'
import { BaseSelect, BaseInput, BaseButton, BaseCard, BaseBadge } from '@/components/ui'

const methodOptions = [
  { value: '', label: 'Todos los métodos' },
  { value: 'huella', label: 'Huella' },
  { value: 'cedula', label: 'Cédula' },
]
const statusOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'permitido', label: 'Permitido' },
  { value: 'denegado', label: 'Denegado' },
]

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
