<template>
  <div v-if="show" class="fixed inset-0 flex items-center justify-center z-50 p-4" :style="{ background: 'var(--modal-backdrop)' }">
    <div class="w-full max-w-md p-6 rounded-lg shadow-lg" :style="{ background: 'var(--modal-panel-bg)', border: '1px solid var(--modal-panel-border)' }">
      <h2 class="text-xl font-bold mb-4">Asignar membresía a {{ member?.name }}</h2>

      <form @submit.prevent="asignar">
        <label class="block mb-1 text-sm">Plan</label>
        <select v-model="planId" class="field-input" required>
          <option disabled value="">Seleccione un plan</option>
          <option v-for="plan in planes" :key="plan.id" :value="plan.id">
            {{ plan.name }}
          </option>
        </select>

        <div class="flex justify-end gap-3 mt-4">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">Cancelar</button>
          <button type="submit" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded" :disabled="loading">
            {{ loading ? 'Asignando...' : 'Asignar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/axios'
import Swal from 'sweetalert2'

const props = defineProps({
  show: Boolean,
  member: Object,
  planes: Array
})

const emit = defineEmits(['close', 'assigned'])
const planId = ref("")
const loading = ref(false)

const asignar = async () => {
  if (!planId.value) return
  loading.value = true

  try {
    await api.post("/memberships", {
      member_id: props.member.id,
      plan_id: planId.value,
    })

    emit('assigned', props.member) // Notificamos éxito
    planId.value = "" // Reset
  } catch (error) {
    console.error(error)
    Swal.fire('Error', error.response?.data?.error || "Error al asignar.", 'error')
  } finally {
    loading.value = false
  }
}
</script>
