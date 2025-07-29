<template>


  <div class="p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">

      <Sidebar />
    <h1 class="text-2xl font-bold mb-4">👥 Clientes</h1>

    <!-- Botones -->
    <div class="flex justify-end items-center mb-6">
      <div class="flex gap-4">
        <router-link to="/Menu" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow">
          🏠 Inicio
        </router-link>
        <button @click="abrirModal" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow">
          ➕ Agregar Cliente
        </button>
      </div>
    </div>

    <!-- Buscador -->
    <input
      v-model="busqueda"
      type="text"
      placeholder="🔍 Buscar por nombre o correo"
      class="w-full border px-4 py-2 mb-4 rounded shadow-sm text-black"
    />

    <!-- Tabla de miembros -->
    <div v-if="loading" class="text-gray-500">Cargando Clientes...</div>
    <div v-else>
      <table v-if="members.length > 0" class="min-w-full bg-white shadow rounded-lg text-left">
        <thead class="bg-gray-100 text-left text-black  border-b">
          <tr>
            <th class="py-2 px-4">#</th>
            <th class="py-2 px-4">Nombre</th>
            <th class="py-2 px-4">Email</th>
            <th class="py-2 px-4">Teléfono</th>
            <th class="py-2 px-4">Nacimiento</th>
            <th class="py-2 px-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(member, index) in miembrosFiltrados" :key="member.id" class="border-t text-black">
            <td class="py-2 px-4">{{ index + 1 }}</td>
            <td class="py-2 px-4">{{ member.name }}</td>
            <td class="py-2 px-4">{{ member.email }}</td>
            <td class="py-2 px-4">{{ member.phone }}</td>
            <td class="py-2 px-4">{{ member.birth_date }}</td>
            <td class="py-2 px-4">
              <router-link :to="{ name: 'MemberDetail', params: { id: member.id } }" class="text-blue-600 hover:underline">
                Ver detalle
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="text-gray-500 mt-4">
        No hay Clientes registrados.
      </div>
    </div>

    <!-- Modal -->
 <div v-if="modalAbierto" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white text-black w-full max-w-lg p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
    <h2 class="text-xl font-bold mb-4">Registrar nuevo cliente</h2>

    <form @submit.prevent="registrarMiembro">
      <!-- Campos del miembro -->
      <input
        v-model="nuevoMiembro.name"
        type="text"
        required
        placeholder="Nombre"
        class="w-full mb-2 p-2 border rounded"
      />
      <input
        v-model="nuevoMiembro.email"
        type="email"
        required
        placeholder="Email"
        class="w-full mb-2 p-2 border rounded"
      />
      <input
        v-model="nuevoMiembro.phone"
        type="text"
        required
        placeholder="Teléfono"
        class="w-full mb-2 p-2 border rounded"
      />
      <label class="block mb-1 text-sm">Fecha de nacimiento</label>
      <input
        v-model="nuevoMiembro.birth_date"
        type="date"
        required
        class="w-full mb-4 p-2 border rounded"
      />

      <!-- Sexo -->
<label class="block mb-1 text-sm">Sexo</label>
<select v-model="nuevoMiembro.sexo" class="w-full mb-2 p-2 border rounded">
  <option disabled value="">Seleccione una opción</option>
  <option value="masculino">Masculino</option>
  <option value="femenino">Femenino</option>
  <option value="no binario">No binario</option>
  <option value="prefiere no decirlo">Prefiere no decirlo</option>
  <option value="otro">Otro</option>
</select>

<!-- Estatura -->
<label class="block mb-1 text-sm">Estatura (en metros)</label>
<input v-model.number="nuevoMiembro.estatura" type="number" step="0.01" min="0" placeholder="Ej. 1.70" class="w-full mb-2 p-2 border rounded" />

<!-- Peso -->
<label class="block mb-1 text-sm">Peso (en kilogramos)</label>
<input v-model.number="nuevoMiembro.peso" type="number" step="0.1" min="0" placeholder="Ej. 70.5" class="w-full mb-2 p-2 border rounded" />

<!-- Antecedentes médicos -->
<label class="block mb-1 text-sm">Antecedentes médicos</label>
<textarea v-model="nuevoMiembro.medical_history" rows="3" placeholder="Ej. Asma, diabetes..." class="w-full mb-4 p-2 border rounded"></textarea>


      <!-- Botones -->
      <div class="flex justify-end gap-3">
        <button type="button" @click="cerrarModal" class="text-gray-600 px-4 py-2">
          Cancelar
        </button>
        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Guardar
        </button>
      </div>
    </form>
  </div>
</div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import Sidebar from '@/views/Sidebar.vue'

const members = ref([])
const loading = ref(true)
const busqueda = ref('')
const token = localStorage.getItem('token')

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: 'application/json'
}

// Modal
const modalAbierto = ref(false)
const nuevoMiembro = ref({
  name: '',
  email: '',
  phone: '',
  birth_date: '',
  medical_history: '',
  sexo: '',
  peso: null,
  estatura: null
})

const nuevaMembresia = ref({
  plan_id: '',
  start_date: ''
})
const planes = ref([])

const abrirModal = () => modalAbierto.value = true
const cerrarModal = () => {
  modalAbierto.value = false
  nuevoMiembro.value = { name: '', email: '', phone: '', birth_date: '' }
  nuevaMembresia.value = { plan_id: '', start_date: '' }
}

const miembrosFiltrados = computed(() => {
  return members.value.filter(member =>
    member.name.toLowerCase().includes(busqueda.value.toLowerCase()) ||
    member.email.toLowerCase().includes(busqueda.value.toLowerCase())
  )
})

const traducirFrecuencia = (f) => {
  const map = { daily: 'Diario', weekly: 'Semanal', biweekly: 'Quincenal', monthly: 'Mensual' }
  return map[f] || f
}

const cargarMiembros = async () => {
  try {
    const { data } = await axios.get('http://127.0.0.1:8000/api/members', { headers })
    members.value = data
  } catch (e) {
    console.error('Error al cargar miembros:', e)
  } finally {
    loading.value = false
  }
}

const cargarPlanes = async () => {
  try {
    const { data } = await axios.get('http://127.0.0.1:8000/api/membershipPlan', { headers })
    planes.value = data
  } catch (e) {
    console.error('Error al cargar planes:', e)
  }
}

const registrarMiembro = async () => {
  try {
    const res = await axios.post('http://127.0.0.1:8000/api/members', nuevoMiembro.value, { headers })
    const nuevoId = res.data.id

    // Si hay plan seleccionado y fecha, asignar membresía
    if (nuevaMembresia.value.plan_id && nuevaMembresia.value.start_date) {
      await axios.post('http://127.0.0.1:8000/api/memberships', {
        member_id: nuevoId,
        plan_id: nuevaMembresia.value.plan_id,
        start_date: nuevaMembresia.value.start_date
      }, { headers })
    }

    cerrarModal()
    cargarMiembros()
  } catch (e) {
    console.error('Error al registrar miembro:', e)
    alert('Error al registrar el miembro.')
  }
}

onMounted(() => {
  cargarMiembros()
  cargarPlanes()
})
</script>


