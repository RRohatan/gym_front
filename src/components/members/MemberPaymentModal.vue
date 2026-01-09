<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
    <div class="bg-white text-black w-full max-w-md p-6 rounded-lg shadow-2xl border-t-4 border-green-500">
      <h2 class="text-xl font-bold mb-2 text-gray-800">💰 Registrar Pago</h2>
      <p class="text-sm text-gray-600 mb-4">Cliente: <strong>{{ member?.name }}</strong></p>

      <div v-if="loadingBalance" class="text-center py-4">Buscando deuda...</div>

      <form v-else @submit.prevent="pagar">
        <div class="mb-4 bg-gray-100 p-3 rounded">
          <p class="text-sm text-gray-500">Monto a pagar:</p>
          <p class="text-2xl font-bold text-green-700">
            {{ formatCurrency(amount) }}
          </p>
        </div>

        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium">Método de Pago</label>
          <select v-model="paymentMethodId" class="w-full border rounded px-3 py-2" required>
            <option value="" disabled>Seleccione...</option>
            <option v-for="m in paymentMethods" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button type="button" @click="$emit('close')" class="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
            Cancelar
          </button>
          <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold shadow-lg" :disabled="processing">
            {{ processing ? 'Procesando...' : '✅ Confirmar Pago' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import api from '@/axios'
import Swal from 'sweetalert2'

const props = defineProps({
  show: Boolean,
  member: Object
})

const emit = defineEmits(['close', 'paid'])

const paymentMethods = ref([])
const amount = ref(0)
const paymentMethodId = ref("")
const loadingBalance = ref(false)
const processing = ref(false)

// Cargar métodos de pago una sola vez
onMounted(async () => {
  try {
    const { data } = await api.get('/payment_methods')
    paymentMethods.value = data
  } catch (e) { console.error(e) }
})

// Cuando se abre el modal, buscar la deuda
watch(() => props.show, async (val) => {
  if (val && props.member) {
    loadingBalance.value = true
    amount.value = 0
    paymentMethodId.value = ""
    try {
      const { data } = await api.get(`/memberships/by-member/${props.member.id}`)
      amount.value = data.outstanding_balance

      if (amount.value <= 0) {
        Swal.fire("Todo al día", "Este cliente no tiene deuda.", "info")
        emit('close')
      }
    } catch (e) {
      Swal.fire("Error", "No tiene membresía o no se pudo calcular la deuda.", "error")
      emit('close')
    } finally {
      loadingBalance.value = false
    }
  }
})

const pagar = async () => {
  processing.value = true
  try {
    await api.post('/payments', {
      member_id: props.member.id,
      amount: amount.value,
      payment_method_id: paymentMethodId.value
    })

    Swal.fire({ title: '¡Pago Exitoso!', icon: 'success', timer: 1500, showConfirmButton: false })
    emit('paid')
    emit('close')
  } catch (error) {
    Swal.fire("Error", "No se pudo registrar el pago.", "error")
  } finally {
    processing.value = false
  }
}

const formatCurrency = (val) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
}
</script>
