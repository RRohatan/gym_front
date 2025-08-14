<template>
  <div class="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-black">
    <Sidebar />
    <div class="max-w-7xl mx-auto bg-white shadow-lg rounded-2xl p-4 sm:p-8">
      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">💰 Pagos</h1>
        <div class="flex flex-wrap gap-3">
          <router-link
            to="/Menu"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow text-sm sm:text-base"
          >
            🏠 Inicio
          </router-link>
          <button
            @click="openModal = true"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow text-sm sm:text-base"
          >
            ➕ Registrar pago
          </button>
        </div>
      </div>

      <!-- Total Recolectado -->
      <div class="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 mb-6 rounded">
        <p class="text-base sm:text-lg font-semibold">💰 Total Recolectado Hoy:</p>
        <p class="text-xl sm:text-2xl font-bold">
          {{ formatCurrency(totalHoy) }}
        </p>
      </div>

      <!-- Tabla de Pagos -->
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white">
          <thead>
            <tr class="text-left border-b text-gray-600">
              <th class="py-3 px-4 whitespace-nowrap">Cliente</th>
              <th class="py-3 px-4 whitespace-nowrap">Monto</th>
              <th class="py-3 px-4 whitespace-nowrap">Método</th>
              <th class="py-3 px-4 whitespace-nowrap">Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pago in pagos" :key="pago.id" class="border-b hover:bg-gray-50">
              <td class="py-3 px-4">{{ pago.paymentable?.member?.name || '—' }}</td>
              <td class="py-3 px-4">{{ formatCurrency(pago.amount) }}</td>
              <td class="py-3 px-4">{{ pago.payment_method?.name }}</td>
              <td class="py-3 px-4">{{ formatDate(pago.paid_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal -->
      <div v-if="openModal" class="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 px-4">
        <div class="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
          <h2 class="text-xl font-bold mb-4">Registrar nuevo pago</h2>

          <form @submit.prevent="registrarPago">
            <!-- Buscar cliente -->
            <div class="mb-4">
              <label class="block mb-1 text-sm">Buscar cliente</label>
              <input
                v-model="busqueda"
                type="text"
                placeholder="Escriba nombre o correo"
                class="w-full border px-3 py-2 rounded"
                autocomplete="off"
              />
              <ul
                v-if="miembrosFiltrados.length > 0"
                class="border rounded bg-white mt-1 max-h-40 overflow-y-auto"
              >
                <li
                  v-for="miembro in miembrosFiltrados"
                  :key="miembro.id"
                  @click="seleccionarMiembro(miembro)"
                  class="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                >
                  {{ miembro.name }} – {{ miembro.email }}
                </li>
              </ul>
            </div>

            <!-- Monto -->
            <div class="mb-4">
              <label class="block mb-1 text-sm">Monto</label>
              <input v-model="nuevoPago.amount" placeholder="Escriba un valor sin puntos ni comas" type="number" min="0" step="0.01" required class="w-full border rounded px-3 py-2">
            </div>

            <!-- Método -->
            <div class="mb-4">
              <label class="block mb-1 text-sm">Método de pago</label>
              <select v-model="nuevoPago.payment_method_id" required class="w-full border rounded px-3 py-2">
                <option disabled value="">Seleccione un método</option>
                <option v-for="m in metodosPago" :key="m.id" :value="m.id">{{ m.name }}</option>
              </select>
            </div>

            <!-- Botones -->
            <div class="flex justify-end space-x-3">
              <button type="button" @click="cerrarModal" class="px-4 py-2 text-gray-600">Cancelar</button>
              <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/axios'
import Sidebar from '@/views/Sidebar.vue'

const pagos = ref([])
const miembros = ref([])
const metodosPago = ref([])
const openModal = ref(false)
const busqueda = ref('')
const totalHoy = ref(0)

const nuevoPago = ref({
  member_id: '',
  amount: '',
  payment_method_id: '',
})

// Obtener datos del backend
const cargarPagos = async () => {
  const { data } = await api.get('/payments')
  pagos.value = data
}

const cargarMiembros = async () => {
  const { data } = await api.get('/members')
  miembros.value = data
}

const cargarMetodos = async () => {
  const { data } = await api.get('/payment_methods')
  metodosPago.value = data
}

const cargarTotalHoy = async () => {
  try {
    const { data } = await api.get('/paymentsToday')
    totalHoy.value = data.total
  } catch (error) {
    console.error('Error cargando total de hoy', error)
  }
}

// Función para registrar el pago
const registrarPago = async () => {
  try {
    await api.post('/payments', {
      member_id: nuevoPago.value.member_id,
      amount: nuevoPago.value.amount,
      payment_method_id: nuevoPago.value.payment_method_id,
    })

    limpiarFormulario()
    openModal.value = false
    await cargarPagos()
    alert('pago exitoso');
    await cargarTotalHoy() // ✅ ACTUALIZA el total del día SIN recargar la página
  } catch (error) {
    console.error('Error al registrar el pago:', error.response?.data || error)
    alert('Error al registrar el pago. Ingrese un valor valido')
  }

}


// Funciones auxiliares
const limpiarFormulario = () => {
  busqueda.value = ''
  nuevoPago.value = {
    member_id: '',
    amount: '',
    payment_method_id: '',
  }
}

const cerrarModal = () => {
  openModal.value = false
  limpiarFormulario()
}

const seleccionarMiembro = (miembro) => {
  nuevoPago.value.member_id = miembro.id
  busqueda.value = `${miembro.name} - ${miembro.email}`
}

const miembrosFiltrados = computed(() => {
  const term = busqueda.value.toLowerCase()
  if (!term) return []
  return miembros.value.filter(m =>
    m.name.toLowerCase().includes(term) || m.email.toLowerCase().includes(term)
  )
})

const formatCurrency = (val) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(val)
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('es-CO')
}

onMounted(() => {
  cargarPagos()
  cargarMiembros()
  cargarMetodos()
  cargarTotalHoy()
})
</script>



