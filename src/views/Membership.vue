<template>

  <div class="p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">

  <sidebar/>

    <div class="max-w-6xl mx-auto bg-white text-gray-800 shadow-lg rounded-2xl p-8">

      <div class="flex justify-between items-center mb-6">

        <h1 class="text-3xl font-bold">🏋️ Membresías activas</h1>
         <div class="flex gap-4">
          <router-link
           to="/Menu"
           class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow">
           🏠 Inicio
          </router-link>
          <button
          @click="showModal = true"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
        >
          ➕ Asignar nueva membresía
        </button>
         </div>
         </div>

    <div class="overflow-x-auto w-full">
      <div class="flex justify-end mb-4">
  <input
    v-model="busquedaMembresia"
    type="text"
    placeholder="Buscar miembro..."
    class="px-3 py-2 border rounded w-64 text-black"
  />
</div>

          <table class="w-full min-w[900px] bg-white">
        <thead>
          <tr class="text-left border-b text-gray-600">
            <th class="py-3">Cliente</th>
            <th class="py-3">Tipo de membresía</th>
            <th class="py-3">Frecuencia</th>
            <th class="py-3">Inicio</th>
            <th class="py-3">Fin</th>
            <th class="py-3">Estado</th>
            <th class="py-3">Saldo</th>
            <th class="py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in membresiasFiltradas" :key="m.id" class="border-b hover:bg-gray-50">
            <td class="py-3">{{ m.member?.name || '—' }}</td>
            <td class="py-3">{{ m.plan?.membership_type?.name || '—' }}</td>
            <td class="py-3">{{ traducirFrecuencia(m.plan?.frequency) }}</td>
            <td class="py-3">{{ formatDate(m.start_date) }}</td>
           <td class="py-3" :class="getRowColor(m)">
                             {{ formatDate(m.end_date) }}</td>
            <td class="py-3">
              <span
                class="px-2 py-1 rounded text-sm font-semibold"
                :class="{
                  'bg-green-100 text-green-700': m.status === 'active',
                  'bg-gray-200 text-gray-600': m.status !== 'active'
                }"
              >
                {{ m.status }}
              </span>
            </td>
            <td class="py-3">
  {{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(m.outstanding_balance || 0) }}
</td>
  <td class="py-3">
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

      <div v-if="membresias.length === 0" class="text-center text-gray-500 mt-8">
        No hay membresías activas registradas.
      </div>
    </div>

    <!-- Modal de Edición -->
<div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
  <div class="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
    <h2 class="text-lg font-bold mb-4">Editar membresía</h2>

    <form @submit.prevent="guardarCambios">

      <div class="mb-4">
        <label class="block text-sm text-gray-700 mb-1">Plan</label>
        <select v-model="editarMembresia.plan.id" class="w-full border px-3 py-2 rounded text-black">
          <option v-for="plan in planes" :key="plan.id" :value="plan.id">
            {{ plan.membership_type?.name }} – {{ traducirFrecuencia(plan.frequency) }}
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label class="block text-sm font-medium text-gray-700">Fecha inicio</label>
        <input v-model="editarMembresia.start_date" type="date" class="w-full border rounded px-3 py-2 text-black" />
      </div>

      <div class="mb-3">
        <label class="block text-sm font-medium text-gray-700">Fecha fin</label>
        <input v-model="editarMembresia.end_date" type="date" class="w-full border rounded px-3 py-2 text-black" />
      </div>

      <div class="mb-3">
        <label class="block text-sm font-medium text-gray-700">Estado</label>
        <select v-model="editarMembresia.status" class="w-full border rounded px-3 py-2 text-black">
          <option value="active">Activa</option>
          <option value="inactive">Inactiva</option>
          <option value="cancelled">Cancelada</option>
        </select>
      </div>

      <div class="flex justify-end space-x-2">
        <button @click="cerrarEditarModal" type="button" class="px-4 py-2 text-gray-600">Cancelar</button>
        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Guardar cambios
        </button>
      </div>
    </form>
  </div>
</div>


    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 class="text-xl font-bold mb-4 text-gray-800">Asignar nueva membresía</h2>

        <form @submit.prevent="asignarMembresia">
          <div class="mb-4">
            <label class="block text-sm mb-1 text-gray-700">Buscar miembro</label>
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
                class="px-3 py-2 hover:bg-blue-100 cursor-pointer text-black"
              >
                {{ m.name }} – {{ m.email }}
              </li>
            </ul>
          </div>

          <div class="mb-4">
            <label class="block text-sm mb-1 text-gray-700">Plan</label>
            <select v-model="form.plan_id" class="w-full border rounded px-3 py-2 text-black" required>
              <option disabled value="">Seleccione un plan</option>
              <option v-for="p in planes" :key="p.id" :value="p.id">
                {{ p.membership_type?.name }} - {{ traducirFrecuencia(p.frequency) }} - ${{ parseInt(p.price).toLocaleString() }}
              </option>
            </select>
          </div>

          <div class="mb-4">
            <label class="block text-sm mb-1 text-gray-700">Fecha de inicio</label>
            <input type="date" v-model="form.start_date" class="w-full border rounded px-3 py-2 text-black" required />
          </div>

          <div class="mb-4">
            <label class="block text-sm mb-1 text-gray-700">Estado</label>
            <select v-model="form.status" class="w-full border rounded px-3 py-2 text-black">
              <option value="active">Activa</option>
              <option value="inactive">Inactiva</option>
            </select>
          </div>

          <div class="flex justify-end space-x-2 mt-4">
            <button type="button" @click="cerrarModal" class="px-4 py-2 text-gray-600">Cancelar</button>
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Asignar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import api from '@/axios'
import { ref, onMounted, computed } from 'vue'
import dayjs from 'dayjs'
import Sidebar from '@/views/Sidebar.vue'

const membresias = ref([])
const miembros = ref([])
const planes = ref([])
const showModal = ref(false)
const showEditModal = ref(false)
const editarMembresia = ref({})
const busquedaMembresia = ref('')

const form = ref({
  member_id: '',
  plan_id: '',
  start_date: '',
  end_date: '',
  status: 'active'
})

const busqueda = ref('')

const membresiasFiltradas = computed(() => {
  const term = busquedaMembresia.value.toLowerCase()
  return term
  ?membresias.value.filter(m => m.member?.name?.toLowerCase().includes(term))
  : membresias.value
}
)

const cargarMembresias = async () => {
  try {
    const { data } = await api.get('/memberships?status=active')
    membresias.value = data
  } catch (error) {
    console.error('Error al cargar membresías:', error)
  }
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
        m.name.toLowerCase().includes(term) || m.email.toLowerCase().includes(term)
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

const asignarMembresia = async () => {
  try {
    const plan = planes.value.find(p => p.id === form.value.plan_id)
    const inicio = dayjs(form.value.start_date)
    let fin = inicio

    switch (plan.frequency) {
      case 'daily': fin = inicio.add(1, 'day'); break
      case 'weekly': fin = inicio.add(1, 'week'); break
      case 'biweekly': fin = inicio.add(15, 'day'); break
      case 'monthly': fin = inicio.add(1, 'month'); break
    }

    form.value.end_date = fin.format('YYYY-MM-DD')

    await api.post('/memberships', form.value)

    cerrarModal()
    await cargarMembresias()
    alert('Membresía asignada correctamente')
  } catch (error) {
    console.error('Error al asignar membresía:', error)
    alert('Error al asignar la membresía.')
  }
}

const formatDate = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-CO')
}

const traducirFrecuencia = (f) => {
  switch (f) {
    case 'daily': return 'Diaria'
    case 'weekly': return 'Semanal'
    case 'biweekly': return 'Quincenal'
    case 'monthly': return 'Mensual'
    default: return f
  }
}

onMounted(() => {
  cargarMembresias()
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

  if (diffDays <= 3 && diffDays >= 0) {
    return 'bg-yellow-100 text-yellow-800 font-semibold'
  }

  return ''
}

const abrirEditarModal = (membresia) => {
  editarMembresia.value = { ...membresia }
  showEditModal.value = true
}

const cerrarEditarModal = () => {
  showEditModal.value = false
  editarMembresia.value = {}
}

const guardarCambios = async () => {
  try {
    await api.put(
      `/memberships/${editarMembresia.value.id}`,
      {
        plan_id: editarMembresia.value.plan.id,     // 👈 editando plan
        start_date: editarMembresia.value.start_date,
        end_date: editarMembresia.value.end_date,
        status: editarMembresia.value.status
      }
    )

    showEditModal.value = false
    await cargarMembresias()
    alert('Membresía actualizada correctamente')
  } catch (error) {
    console.error('Error al guardar cambios:', error)
    alert('No se pudo actualizar la membresía.')
  }
}

</script>

