<template>
  <div class="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
    <sidebar />

    <div class="max-w-6xl mx-auto bg-white text-gray-800 shadow-lg rounded-2xl p-4 sm:p-8">
      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <!-- Título ahora es dinámico -->
        <h1 class="text-2xl sm:text-3xl ml-16 first:font-bold">
          🏋️ Membresías: {{ tituloFiltro }}
        </h1>
        <div class="flex flex-wrap ml-6 gap-3">
          <router-link
            to="/Menu"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow text-sm"
          >
            🏠 Inicio
          </router-link>
          <button
            @click="showModal = true"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow text-sm"
          >
            ➕ Asignar nueva membresía
          </button>
        </div>
      </div>

      <!-- ===== SECCIÓN DE FILTROS (MODIFICADA) ===== -->
      <div class="flex flex-wrap gap-3 mb-4">
        <button
          @click="filtrarMembresias('')"
          :class="statusFilter === '' ? 'btn-filter-active' : 'btn-filter-inactive'"
        >
          Activas y Vencidas (Defecto)
        </button>
        <button
          @click="filtrarMembresias('inactive_unpaid')"
          :class="statusFilter === 'inactive_unpaid' ? 'btn-filter-active' : 'btn-filter-inactive'"
        >
          Inactivas (Por Pagar)
        </button>
         <button
          @click="filtrarMembresias('active')"
          :class="statusFilter === 'active' ? 'btn-filter-active' : 'btn-filter-inactive'"
        >
          Solo Activas
        </button>

        <!-- --- ¡BOTÓN NUEVO AÑADIDO! --- -->
        <button
          @click="filtrarMembresias('expiring_soon')"
          :class="statusFilter === 'expiring_soon' ? 'btn-filter-active' : 'btn-filter-inactive'"
        >
          Próximas a Vencer (3 Días)
        </button>
        <!-- --- FIN DEL CAMBIO --- -->

        <button
          @click="filtrarMembresias('all')"
          :class="statusFilter === 'all' ? 'btn-filter-active' : 'btn-filter-inactive'"
        >
          Ver Todas
        </button>
      </div>
      <!-- ===== FIN DE FILTROS ===== -->

      <!-- Buscador -->
      <div class="flex justify-end mb-4">
        <input
          v-model="busquedaMembresia"
          type="text"
          placeholder="Buscar miembro..."
          class="px-3 py-2 border rounded w-full sm:w-64 text-black"
        />
      </div>

      <!-- Tabla responsive -->
      <div class="overflow-x-auto rounded-lg">
        <div v-if="loading" class="py-10 text-center text-gray-500">Cargando membresías...</div>
        <table v-else class="min-w-[900px] w-full bg-white text-sm sm:text-base">
          <!-- ... (thead sin cambios) ... -->
          <thead>
            <tr class="text-left border-b text-gray-600">
              <th class="py-3 px-2">Cliente</th>
              <th class="py-3 px-2">Tipo de membresía</th>
              <th class="py-3 px-2">Frecuencia</th>
              <th class="py-3 px-2">Inicio</th>
              <th class="py-3 px-2">Fin</th>
              <th class="py-3 px-2">Estado</th>
              <th class="py-3 px-2">Saldo</th>
              <th class="py-3 px-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="membresiasFiltradas.length === 0">
              <td colspan="8" class="py-10 text-center text-gray-500">No se encontraron membresías con este filtro.</td>
            </tr>
            <tr
              v-for="m in membresiasFiltradas"
              :key="m.id"
              class="border-b hover:bg-gray-50"
            >
              <td class="py-3 px-2">{{ m.member?.name || '—' }}</td>
              <td class="py-3 px-2">{{ m.plan?.membership_type?.name || '—' }}</td>
              <td class="py-3 px-2">{{ traducirFrecuencia(m.plan?.frequency) }}</td>
              <td class="py-3 px-2">{{ formatDate(m.start_date) }}</td>
              <td class="py-3 px-2" :class="getRowColor(m)">
                {{ formatDate(m.end_date) }}
              </td>
              <td class="py-3 px-2">
                <!-- Estilos de estado mejorados -->
                <span
                  class="px-2 py-1 rounded text-xs sm:text-sm font-semibold"
                  :class="{
                    'bg-green-100 text-green-700': m.status === 'active',
                    'bg-red-100 text-red-700': m.status === 'expired',
                    'bg-yellow-100 text-yellow-700': m.status === 'inactive_unpaid' || getRowColor(m).includes('yellow'), // Próximo a vencer
                    'bg-gray-200 text-gray-600': m.status === 'cancelled'
                  }"
                >
                  {{ traducirEstado(m.status) }}
                </span>
              </td>
              <td class="py-3 px-2">
                {{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(m.outstanding_balance || 0) }}
              </td>
              <td class="py-3 px-2">
                <button
                  class="text-blue-600 hover:underline"
                  @click="abrirEditarModal(m)"
                >
                  ✏️ Editar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ... (Modales de Edición y Asignar Membresía sin cambios) ... -->
      <!-- Modal de Edición -->
      <div
        v-if="showEditModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white text-black w-full max-w-md p-6 rounded-lg shadow-lg">
          <h2 class="text-lg font-bold mb-4">Editar membresía</h2>
          <form @submit.prevent="guardarCambios">
            <div class="mb-4">
              <label class="block text-sm mb-1">Plan</label>
              <select
                v-model="editarMembresia.plan.id"
                class="w-full border px-3 py-2 rounded text-black"
              >
                <option v-for="plan in planes" :key="plan.id" :value="plan.id">
                  {{ plan.membership_type?.name }} – {{ traducirFrecuencia(plan.frequency) }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="block text-sm mb-1">Fecha inicio</label>
              <input v-model="editarMembresia.start_date" type="date" class="w-full border rounded px-3 py-2 text-black" />
            </div>

            <div class="mb-3">
              <label class="block text-sm mb-1">Fecha fin</label>
              <input v-model="editarMembresia.end_date" type="date" class="w-full border rounded px-3 py-2 text-black" />
            </div>

            <div class="mb-3">
              <label class="block text-sm mb-1">Estado</label>
              <select v-model="editarMembresia.status" class="w-full border rounded px-3 py-2 text-black">
                <option value="active">Activa</option>
                <option value="expired">Vencida</option>
                <option value="inactive_unpaid">Inactiva (Por Pagar)</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>

            <div class="flex justify-end gap-2">
              <button @click="cerrarEditarModal" type="button" class="text-gray-600 px-4 py-2">Cancelar</button>
              <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Asignar Membresía -->
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white text-black w-full max-w-lg p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
          <h2 class="text-xl font-bold mb-4">Asignar nueva membresía</h2>
          <form @submit.prevent="asignarMembresia">
            <!-- Buscador miembro -->
            <div class="mb-4">
              <label class="block text-sm mb-1">Buscar miembro</label>
              <input
                v-model="busqueda"
                type="text"
                placeholder="Nombre o correo"
                class="w-full border rounded px-3 py-2 text-black"
                autocomplete="off"
              />
              <ul
                v-if="miembrosFiltrados.length"
                class="border rounded bg-white mt-1 max-h-40 overflow-y-auto text-black"
              >
                <li
                  v-for="m in miembrosFiltrados"
                  :key="m.id"
                  @click="seleccionarMiembro(m)"
                  class="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                >
                  {{ m.name }} – {{ m.email }}
                </li>
              </ul>
            </div>

            <!-- Plan -->
            <div class="mb-4">
              <label class="block text-sm mb-1">Plan</label>
              <select v-model="form.plan_id" class="w-full border rounded px-3 py-2 text-black" required>
                <option disabled value="">Seleccione un plan</option>
                <option v-for="p in planes" :key="p.id" :value="p.id">
                  {{ p.membership_type?.name }} - {{ traducirFrecuencia(p.frequency) }} - ${{ parseInt(p.price).toLocaleString() }}
                </option>
              </select>
            </div>

            <div class="flex justify-end gap-2 mt-4">
              <button type="button" @click="cerrarModal" class="text-gray-600 px-4 py-2">Cancelar</button>
              <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                Asignar
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>


<script setup>
import api from '@/axios'
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router' // <-- 1. IMPORTAR USE ROUTE
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import Sidebar from '@/views/Sidebar.vue'

dayjs.extend(utc)
const route = useRoute() // <-- 2. OBTENER LA RUTA ACTUAL

const membresias = ref([])
const miembros = ref([])
const planes = ref([])
const showModal = ref(false)
const showEditModal = ref(false)
const editarMembresia = ref({})
const busquedaMembresia = ref('')
const loading = ref(true) // Estado de carga

// --- ESTADO MODIFICADO ---
const statusFilter = ref('') // Por defecto carga el default del API (activas y vencidas)
const tituloFiltro = ref('Activas y Vencidas') // Título dinámico

const form = ref({
  member_id: '',
  plan_id: '',
  end_date: '',
  status: 'active',
})

const busqueda = ref('')

const membresiasFiltradas = computed(() => {
  const term = busquedaMembresia.value.toLowerCase()
  return term
  ?membresias.value.filter(m => m.member?.name?.toLowerCase().includes(term))
  : membresias.value
}
)

// --- FUNCIÓN MODIFICADA ---
const cargarMembresias = async () => {
  loading.value = true
  try {
    // El endpoint ahora es dinámico
    const params = new URLSearchParams()
    if (statusFilter.value) {
      params.append('status', statusFilter.value)
    }

    const { data } = await api.get(`/memberships?${params.toString()}`)
    membresias.value = data
  } catch (error) {
    console.error('Error al cargar membresías:', error)
    membresias.value = [] // Limpiar en caso de error
  } finally {
    loading.value = false
  }
}

// --- FUNCIÓN MODIFICADA ---
// Se llama al hacer clic en los botones de filtro
const filtrarMembresias = (status) => {
  statusFilter.value = status

  // Actualizar título
  if (status === 'active') tituloFiltro.value = 'Solo Activas'
  else if (status === 'inactive_unpaid') tituloFiltro.value = 'Inactivas (Por Pagar)'
  else if (status === 'all') tituloFiltro.value = 'Todas'
  else if (status === 'expiring_soon') tituloFiltro.value = 'Próximas a Vencer' // <-- 3. AÑADIR CASO
  else tituloFiltro.value = 'Activas y Vencidas'

  cargarMembresias() // Recargar datos con el nuevo filtro
}


const cargarMiembros = async () => {
  const { data } = await api.get('/members')
  miembros.value = data
}

const cargarPlanes = async () => {
  const { data } = await api.get('/membershipPlan')
  planes.value = data
}

const miembrosFiltrados = computed(() => {
  const term = busqueda.value.toLowerCase()
  return term
    ? miembros.value.filter(m =>
        m.name.toLowerCase().includes(term) ||
        (m.email || '').toLowerCase().includes(term)
      )
    : []
})

const seleccionarMiembro = (miembro) => {
  form.value.member_id = miembro.id
  busqueda.value = miembro.name + ' – ' + miembro.email
}

const cerrarModal = () => {
  showModal.value = false
  busqueda.value = ''
  form.value = {
    member_id: '',
    plan_id: '',
    start_date: '',
    end_date: '',
    status: 'active'
  }
}

// --- LÓGICA DE ASIGNAR MEMBRESÍA (MODIFICADA) ---
const asignarMembresia = async () => {
  try {
    // 1. Verificar si el miembro ya tiene una membresía (activa, vencida o inactiva)
    let existing = null;
    try {
      const res = await api.get(`/memberships/by-member/${form.value.member_id}`);
      existing = res.data;
    } catch (err) {
      if (err.response && err.response.status !== 404) {
        throw err; // Si el error NO es 404, es un error real
      }
      // Si es 404, está bien, no tiene membresía.
    }

    // Si encontramos una membresía (activa, vencida o inactiva), bloqueamos.
    if (existing) {
      alert(`Este cliente ya tiene una membresía (${existing.status}). No se puede asignar una nueva.`);
      return;
    }

    // 2. Si no tiene, procedemos a crearla
    const plan = planes.value.find(p => p.id === form.value.plan_id)
    if (!plan) {
      alert('Plan no encontrado');
      return;
    }

    // 3. Crear membresía (SIN fecha de fin, se calcula en backend)
    // El backend la creará como 'inactive_unpaid'
    await api.post('/memberships', {
      member_id: form.value.member_id,
      plan_id: form.value.plan_id,
      // Nota: El backend (MembershipController@store) ahora maneja
      // start_date, end_date, outstanding_balance y status ('inactive_unpaid')
    });

    cerrarModal()

    // Al asignar, lo mandamos al filtro de inactivas para que vea la nueva membresía
    filtrarMembresias('inactive_unpaid');

    alert('Membresía asignada (Inactiva). El cliente debe realizar el pago en recepción para activarla.')

  } catch (error) {
    console.error('Error al asignar membresía:', error)
    alert(error.response?.data?.error || 'Error al asignar la membresía.')
  }
}


const formatDate = (fecha) => {
  return dayjs(fecha).format('DD/MM/YYYY ')
}

// --- FUNCIONES DE TRADUCCIÓN MEJORADAS ---
const traducirFrecuencia = (f) => {
  switch (f) {
    case 'daily': return 'Diaria'
    case 'weekly': return 'Semanal'
    case 'biweekly': return 'Quincenal'
    case 'monthly': return 'Mensual'
    default: return f
  }
}

const traducirEstado = (s) => {
  switch (s) {
    case 'active': return 'Activa'
    case 'expired': return 'Vencida'
    case 'inactive_unpaid': return 'Inactiva (Por Pagar)'
    case 'cancelled': return 'Cancelada'
    default: return s
  }
}


// --- ONMOUNTED MODIFICADO (ERROR DE IMAGEN CORREGIDO) ---
onMounted(() => {
  // 4. LEER EL FILTRO DE LA URL (Forma segura en TS)
  const filterFromUrl = route.query.filter

  if (typeof filterFromUrl === 'string' && filterFromUrl) {
    // Si la URL trae un filtro (ej: 'expiring_soon'), usarlo
    filtrarMembresias(filterFromUrl)
  } else {
    // Si no, cargar la vista por defecto
    cargarMembresias()
  }

  cargarMiembros()
  cargarPlanes()
})

const getRowColor = (membresia) => {
  const end = new Date(membresia.end_date)
  const now = new Date()
  const diffDays = (end - now) / (1000 * 60 * 60 * 24)

  if (membresia.status === 'expired') {
    return 'bg-red-100 text-red-700 font-semibold'
  }

  if (membresia.status === 'inactive_unpaid') {
    return 'bg-yellow-100 text-yellow-800 font-semibold'
  }

  // --- LÓGICA MODIFICADA ---
  // Marcar en amarillo si vence pronto Y ESTÁ ACTIVA
  if (diffDays <= 3 && diffDays >= 0 && membresia.status === 'active') {
    return 'bg-yellow-100 text-yellow-800 font-semibold'
  }

  return ''
}

const abrirEditarModal = (membresia) => {
  // Asegurarnos de que las fechas estén en formato YYYY-MM-DD para el input
  editarMembresia.value = {
    ...membresia,
    start_date: dayjs(membresia.start_date).format('YYYY-MM-DD'),
    end_date: dayjs(membresia.end_date).format('YYYY-MM-DD'),
    plan: { // Asegurarnos de que el plan.id exista para el v-model
      id: membresia.plan?.id
    }
  }
  showEditModal.value = true
}

const cerrarEditarModal = () => {
  showEditModal.value = false
  editarMembresia.value = {}
}

const guardarCambios = async () => {
  try {
    const planId = editarMembresia.value.plan?.id || editarMembresia.value.plan_id;

    if (!planId) {
      alert("Error: El plan no está seleccionado correctamente.");
      return;
    }

    await api.put(
      `/memberships/${editarMembresia.value.id}`,
      {
        plan_id: planId,
        start_date: editarMembresia.value.start_date,
        end_date: editarMembresia.value.end_date,
        status: editarMembresia.value.status
      }
    )

    showEditModal.value = false
    await cargarMembresias() // Recarga la lista
    alert('Membresía actualizada correctamente')
  } catch (error) {
    console.error('Error al guardar cambios:', error)
    alert('No se pudo actualizar la membresía.')
  }
}

</script>

<!-- NUEVOS ESTILOS PARA BOTONES DE FILTRO -->
<style scoped>
.btn-filter-active {
  @apply bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow;
}
.btn-filter-inactive {
  @apply bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300;
}
</style>

