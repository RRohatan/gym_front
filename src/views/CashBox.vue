
<template>
  <div class="p-6 bg-gray-100 min-h-screen text-gray-800">
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 space-y-6">

      <h2 class="text-2xl font-bold border-b pb-2">📦 Caja Diaria</h2>

      <div v-if="loading" class="text-gray-500">Cargando...</div>

      <div v-else>
        <div v-if="todayCashbox">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <p><strong>📅 Fecha:</strong> {{ todayCashbox.date }}</p>
            <p><strong>🔓 Saldo apertura:</strong> {{ todayCashbox.opening_balance }} COP</p>
            <p><strong>💰 Ingresos:</strong> {{ todayCashbox.total_income }} COP</p>
            <p><strong>💸 Gastos:</strong> {{ todayCashbox.total_expense }} COP</p>
            <p><strong>🧮 Cierre:</strong> {{ todayCashbox.closing_balance }} COP</p>
          </div>
        </div>
        <div v-else>
          <p class="text-yellow-600 mb-2">⚠️ Aún no se ha abierto la caja de hoy.</p>
          <form @submit.prevent="abrirCaja">
            <label class="block mb-2 font-medium">Saldo de apertura:</label>
            <input
              v-model="nuevoSaldo"
              type="number"
              class="w-full p-2 border rounded"
              placeholder="Ej: 50000"
              required
            />
            <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Abrir caja de hoy
            </button>
          </form>
        </div>

        <!-- Histórico -->
        <div class="mt-10">
          <h3 class="text-xl font-bold mb-3">📚 Histórico de cajas</h3>
          <table class="w-full table-auto border">
            <thead class="bg-gray-200">
              <tr>
                <th class="p-2">Fecha</th>
                <th class="p-2">Apertura</th>
                <th class="p-2">Ingresos</th>
                <th class="p-2">Gastos</th>
                <th class="p-2">Cierre</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cashbox in cashboxes" :key="cashbox.id">
                <td class="p-2">{{ cashbox.date }}</td>
                <td class="p-2">{{ cashbox.opening_balance }} COP</td>
                <td class="p-2">{{ cashbox.total_income }} COP</td>
                <td class="p-2">{{ cashbox.total_expense }} COP</td>
                <td class="p-2">{{ cashbox.closing_balance }} COP</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import dayjs from 'dayjs'

const cashboxes = ref([])
const todayCashbox = ref(null)
const loading = ref(true)
const nuevoSaldo = ref('')

const token = localStorage.getItem('token')
const headers = {
  Authorization: `Bearer ${token}`,
  Accept: 'application/json'
}

const fetchCashboxes = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/dailyCashbox', { headers })
    cashboxes.value = res.data

    const hoy = dayjs().format('YYYY-MM-DD')
    todayCashbox.value = cashboxes.value.find(cb => cb.date === hoy)
  } catch (error) {
    console.error('Error al obtener cajas:', error)
  } finally {
    loading.value = false
  }
}

const abrirCaja = async () => {
  try {
    const res = await axios.post('http://127.0.0.1:8000/api/dailyCashbox', {
      date: dayjs().format('YYYY-MM-DD'),
      opening_balance: parseFloat(nuevoSaldo.value)
    }, { headers })

    cashboxes.value.unshift(res.data)
    todayCashbox.value = res.data
    nuevoSaldo.value = ''
  } catch (err) {
    console.error('Error al abrir caja:', err)
  }
}

onMounted(() => {
  fetchCashboxes()
})
</script>
