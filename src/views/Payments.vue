<template>
  <div class="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-black">
    <Sidebar />
    <div class="max-w-7xl mx-auto bg-white shadow-lg rounded-2xl p-4 sm:p-8">
      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">💰 Historial de Pagos</h1>
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

      <!-- ===== SECCIÓN DE FILTROS (NUEVO) ===== -->
      <div class="bg-gray-50 p-4 rounded-lg mb-6 flex flex-wrap items-center gap-4">
        <div>
          <label for="start-date" class="block text-sm font-medium text-gray-700">Desde:</label>
          <input type="date" id="start-date" v-model="filtros.startDate" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm">
        </div>
        <div>
          <label for="end-date" class="block text-sm font-medium text-gray-700">Hasta:</label>
          <input type="date" id="end-date" v-model="filtros.endDate" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm">
        </div>
        <button
          @click="cargarHistorial"
          class="mt-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md"
          :disabled="loadingHistorial"
        >
          {{ loadingHistorial ? 'Buscando...' : 'Consultar' }}
        </button>
      </div>
      <!-- ===== FIN DE FILTROS ===== -->


      <!-- Total Recolectado (Ahora es dinámico) -->
      <div class="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 mb-6 rounded">
        <p class="text-base sm:text-lg font-semibold">💰 Total Recolectado (en rango):</p>
        <p class="text-xl sm:text-2xl font-bold">
          {{ formatCurrency(totalHistorial) }}
        </p>
      </div>

      <!-- Tabla de Pagos (Ahora Historial) -->
      <div class="overflow-x-auto">
        <div v-if="loadingHistorial" class="text-center py-10">
          <p class="text-gray-500">Cargando historial...</p>
        </div>
        <table v-else class="min-w-full bg-white">
          <thead>
            <tr class="text-left border-b text-gray-600">
              <th class="py-3 px-4 whitespace-nowrap">Cliente</th>
              <th class="py-3 px-4 whitespace-nowrap">Monto</th>
              <th class="py-3 px-4 whitespace-nowrap">Método</th>
              <th class="py-3 px-4 whitespace-nowrap">Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pagos.length === 0">
              <td colspan="4" class="py-10 text-center text-gray-500">No se encontraron pagos en este rango de fechas.</td>
            </tr>
            <tr v-for="pago in pagos" :key="pago.id" class="border-b hover:bg-gray-50">
              <td class="py-3 px-4">{{ pago.paymentable?.member?.name || '—' }}</td>
              <td class="py-3 px-4">{{ formatCurrency(pago.amount) }}</td>
              <td class="py-3 px-4">{{ pago.payment_method?.name }}</td>
              <td class="py-3 px-4">{{ formatDate(pago.paid_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal de registro de pagos -->
      <div v-if="openModal" class="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 px-4">
        <!-- ... (Contenido del modal de registro de pago sin cambios) ... -->
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
              <button type="button" @click="cerrarModal" class="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
              :disabled="ProcesandoPago"
              >Cancelar
              </button>
              <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="ProcesandoPago">

              <span v-if="ProcesandoPago">Guardando... ⏳</span>
              <span v-else> Guardar</span>

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

// --- ESTADO MODIFICADO ---
const pagos = ref([]) // Ahora guarda el historial
const miembros = ref([])
const metodosPago = ref([])
const openModal = ref(false)
const busqueda = ref('')
const totalHistorial = ref(0)
const loadingHistorial = ref(true)

const ProcesandoPago = ref(false)

// Ref para los filtros de fecha
const filtros = ref({
  startDate: new Date().toISOString().split('T')[0], // Hoy por defecto
  endDate: new Date().toISOString().split('T')[0],   // Hoy por defecto
})

const nuevoPago = ref({
  member_id: '',
  amount: '',
  payment_method_id: '',
})

// --- FUNCIÓN MODIFICADA ---
// Ahora carga el historial usando el nuevo endpoint y los filtros
const cargarHistorial = async () => {
  loadingHistorial.value = true
  try {
    const params = new URLSearchParams({
      start_date: filtros.value.startDate,
      end_date: filtros.value.endDate,
    });

    // Usamos el nuevo endpoint del backend
    const { data } = await api.get(`/payments/history?${params.toString()}`)

    pagos.value = data.historial
    totalHistorial.value = data.total_ingresos
  } catch (error) {
    console.error('Error cargando historial de pagos:', error)
    pagos.value = []
    totalHistorial.value = 0
  } finally {
    loadingHistorial.value = false
  }
}

// Cargar solo miembros y métodos (la lógica del modal no cambia)
const cargarMiembros = async () => {
  const { data } = await api.get('/members')
  miembros.value = data
}

const cargarMetodos = async () => {
  const { data } = await api.get('/payment_methods')
  metodosPago.value = data
}

const registrarPago = async () => {
  if (ProcesandoPago.value) return; // Evitar múltiples envíos
  try {
    ProcesandoPago.value = true;

    // Busco la membresía del miembro
    const {data: membership} = await api.get(`/memberships/by-member/${nuevoPago.value.member_id}`);

    // verifico si debe algo (outstanding_balance > 0)
    if (membership.outstanding_balance <= 0) {
      alert('ESTE CLIENTE NO TIENE SALDO PENDIENTE');
      return;
    }

    // Registro el pago
    await api.post('/payments', {
      member_id: nuevoPago.value.member_id,
      amount: nuevoPago.value.amount,
      payment_method_id: nuevoPago.value.payment_method_id,
    });

    // Vuelvo a consultar la membresía para ver el estado actualizado
    const {data: updateMembership} = await api.get(`/memberships/by-member/${nuevoPago.value.member_id}`);

    limpiarFormulario()
    openModal.value = false
    await cargarHistorial() // <-- Recargamos el historial

    // Mensaje segun el estado actualizado
    if (updateMembership.status === 'active' && (membership.status === 'expired' || membership.status === 'inactive_unpaid')) {
      alert('Pago registrado exitosamente. La membresía ha sido reactivada.');
    } else {
      alert('Pago registrado exitosamente.');
    }

  } catch (error) {
    console.error('Error al registrar el pago:', error.response?.data || error)
    // Mostrar error si el miembro no tiene membresía (404)
    if (error.response && error.response.status === 404) {
      alert('Error: Este miembro no tiene ninguna membresía (activa, vencida o inactiva) para asociar el pago.');
    } else {
      alert(error.response?.data?.message || error.response?.data?.error || 'Error al registrar el pago');
    }
  }finally {
    ProcesandoPago.value = false;
  }
}


// Funciones auxiliares (sin cambios)
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
    m.name.toLowerCase().includes(term) ||
    (m.email || '').toLowerCase().includes(term)
  )
})

const formatCurrency = (val) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(val)
}

const formatDate = (dateStr) => {
  // Usar toLocaleString para mostrar fecha y hora
  return new Date(dateStr).toLocaleString('es-CO')
}

// Carga inicial
onMounted(() => {
  cargarHistorial() // Carga el historial de hoy por defecto
  cargarMiembros()
  cargarMetodos()
})
</script>
