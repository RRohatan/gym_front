<template>
  <div class="p-6 bg-gray-100 min-h-screen text-gray-800">
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 space-y-6">

      <div class="flex justify-between items-center border-b pb-4">
        <h2 class="text-2xl font-bold">📦 Caja Diaria</h2>
        <div class="flex gap-3">
          <router-link to="/Menu" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow text-sm">
            🏠 Inicio
          </router-link>
          <button @click="abrirModalGasto" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow text-sm flex items-center gap-2">
            💸 Registrar Gasto
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-gray-500 text-center py-4">Cargando información...</div>

      <div v-else>
        <div v-if="todayCashbox" class="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 class="text-lg font-semibold mb-3 text-blue-800">Resumen de Hoy ({{ todayCashbox.date }})</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div class="bg-white p-3 rounded shadow-sm">
              <p class="text-gray-500">🔓 Apertura</p>
              <p class="text-xl font-bold text-gray-800">{{ formatCurrency(todayCashbox.opening_balance) }}</p>
            </div>
            <div class="bg-white p-3 rounded shadow-sm">
              <p class="text-gray-500">💰 Ingresos</p>
              <p class="text-xl font-bold text-green-600">{{ formatCurrency(todayCashbox.total_income) }}</p>
            </div>
            <div class="bg-white p-3 rounded shadow-sm">
              <p class="text-gray-500">💸 Gastos</p>
              <p class="text-xl font-bold text-red-600">{{ formatCurrency(todayCashbox.total_expense) }}</p>
            </div>
            <div class="bg-white p-3 rounded shadow-sm border-l-4 border-blue-500">
              <p class="text-gray-500">🧮 Cierre Estimado</p>
              <p class="text-xl font-bold text-blue-700">{{ formatCurrency(todayCashbox.closing_balance) }}</p>
            </div>
          </div>
        </div>

        <div v-else class="bg-yellow-50 p-6 rounded-lg border border-yellow-200 text-center">
          <p class="text-yellow-800 text-lg font-medium mb-4">⚠️ Aún no se ha abierto la caja de hoy.</p>
          <form @submit.prevent="abrirCaja" class="max-w-sm mx-auto">
            <label class="block mb-2 font-medium text-left">Saldo de apertura:</label>
            <div class="flex gap-2">
              <input
                v-model="nuevoSaldo"
                type="number"
                class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej: 50000"
                required
              />
              <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold shadow">
                Abrir
              </button>
            </div>
          </form>
        </div>

        <div class="mt-10">
          <h3 class="text-xl font-bold mb-3 text-gray-700">📚 Histórico de cajas</h3>
          <div class="overflow-x-auto">
            <table class="w-full table-auto border bg-white rounded-lg shadow-sm">
              <thead class="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th class="p-3 text-left">Fecha</th>
                  <th class="p-3 text-right">Apertura</th>
                  <th class="p-3 text-right">Ingresos</th>
                  <th class="p-3 text-right">Gastos</th>
                  <th class="p-3 text-right">Cierre</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cashbox in cashboxes" :key="cashbox.id" class="border-b hover:bg-gray-50 transition">
                  <td class="p-3">{{ cashbox.date }}</td>
                  <td class="p-3 text-right">{{ formatCurrency(cashbox.opening_balance) }}</td>
                  <td class="p-3 text-right text-green-600">{{ formatCurrency(cashbox.total_income) }}</td>
                  <td class="p-3 text-right text-red-600">{{ formatCurrency(cashbox.total_expense) }}</td>
                  <td class="p-3 text-right font-bold">{{ formatCurrency(cashbox.closing_balance) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-if="showExpenseModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white w-full max-w-md p-6 rounded-lg shadow-xl">
          <h2 class="text-xl font-bold mb-4 text-gray-800">💸 Registrar Nuevo Gasto</h2>
          <form @submit.prevent="guardarGasto">
            <div class="mb-4">
              <label class="block text-sm font-medium mb-1">Concepto</label>
              <input v-model="expenseForm.concepto" type="text" required placeholder="Ej: Pago de luz, Compra de jabón..." class="w-full border rounded px-3 py-2" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1">Monto</label>
              <input v-model.number="expenseForm.monto" type="number" required min="0" placeholder="0" class="w-full border rounded px-3 py-2" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1">Fecha</label>
              <input v-model="expenseForm.fecha" type="date" required class="w-full border rounded px-3 py-2" />
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="showExpenseModal = false" class="text-gray-600 px-4 py-2 hover:bg-gray-100 rounded">Cancelar</button>
              <button type="submit" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold shadow">
                Guardar Gasto
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import api from '@/axios'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'

const cashboxes = ref([])
const todayCashbox = ref(null)
const loading = ref(true)
const nuevoSaldo = ref('')

// Estado para Gastos
const showExpenseModal = ref(false)
const expenseForm = reactive({
  concepto: '',
  monto: '',
  fecha: dayjs().format('YYYY-MM-DD')
})

const fetchCashboxes = async () => {
  try {
    const { data } = await api.get('/dailyCashbox')
    cashboxes.value = data

    // Usamos substring para comparar solo la fecha YYYY-MM-DD
    const hoy = dayjs().format('YYYY-MM-DD')
    todayCashbox.value = cashboxes.value.find(cb =>
      cb.date.substring(0, 10) === hoy
    )
  } catch (error) {
    console.error('Error al obtener cajas:', error)
  } finally {
    loading.value = false
  }
}

const abrirCaja = async () => {
  try {
    const { data } = await api.post('/dailyCashbox', {
      date: dayjs().format('YYYY-MM-DD'),
      opening_balance: parseFloat(nuevoSaldo.value)
    })
    cashboxes.value.unshift(data)
    todayCashbox.value = data
    nuevoSaldo.value = ''
    Swal.fire('Éxito', 'Caja abierta correctamente', 'success')
  } catch (err) {
    console.error(err)
    if (err.response && err.response.status === 422 && err.response.data.errors.date) {
        Swal.fire({
          title: 'Caja ya existente',
          text: 'Ya existe una caja para hoy. Recargando...',
          icon: 'warning',
          timer: 1500,
          showConfirmButton: false
        }).then(() => fetchCashboxes())
    } else {
        Swal.fire('Error', 'No se pudo abrir la caja.', 'error')
    }
  }
}

// --- LÓGICA DE GASTOS ---
const abrirModalGasto = () => {
  expenseForm.concepto = ''
  expenseForm.monto = ''
  expenseForm.fecha = dayjs().format('YYYY-MM-DD')
  showExpenseModal.value = true
}

const guardarGasto = async () => {
  try {
    // Asumimos que la ruta es /gastos (estándar en Laravel).
    // Si no funciona, verifica en routes/api.php
    await api.post('/gastos', expenseForm)

    showExpenseModal.value = false
    Swal.fire('Registrado', 'El gasto ha sido registrado.', 'success')

    // Recargamos la caja para ver actualizado el Total de Gastos y el Cierre
    await fetchCashboxes()

  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'No se pudo registrar el gasto.', 'error')
  }
}

const formatCurrency = (val) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
}

onMounted(() => {
  fetchCashboxes()
})
</script>
