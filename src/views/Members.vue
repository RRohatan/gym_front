<template>
  <div class="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
    <Sidebar />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h1 class="text-2xl font-bold mb-4 ml-12 sm:mb-0">👥 Clientes</h1>
      <div class="flex flex-wrap ml-24 gap-3">
        <router-link to="/Menu" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow text-sm">
          🏠 Inicio
        </router-link>
        <button @click="abrirModal" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow text-sm">
          ➕ Agregar Cliente
        </button>
      </div>
    </div>

    <!-- Buscador -->
    <div class="mb-6">
      <input
        v-model="busqueda"
        type="text"
        placeholder="🔍 Buscar por nombre o teléfono"
        class="w-full border px-4 py-2 rounded shadow-sm text-black"
      />
    </div>

    <!-- Tarjetas de clientes -->
    <div v-if="loading" class="text-gray-300">Cargando Clientes...</div>
    <div v-else>
      <div v-if="members.length === 0" class="text-gray-400">No hay Clientes registrados.</div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="member in miembrosFiltrados"
          :key="member.id"
          class="bg-white text-black rounded-xl shadow-lg overflow-hidden transition hover:scale-[1.01] duration-150"
        >
          <div class="p-4 flex justify-between items-center">
            <div>
              <h2 class="text-lg font-bold text-gray-800">🧍 {{ member.name }}</h2>
              <p class="text-sm text-gray-600">📞 {{ member.phone }}</p>
              <p class="text-sm text-gray-600">🎂 {{ member.birth_date }}</p>
            </div>
            <button @click="toggleDetalle(member.id)" class="text-blue-600 hover:underline text-sm">
              {{ detallesAbiertos.includes(member.id) ? 'Ocultar' : 'Ver más' }}
            </button>
          </div>

          <!-- Detalle Expandible -->
          <div v-if="detallesAbiertos.includes(member.id)" class="px-4 pb-4 text-sm text-gray-700 space-y-2">
            <p>📧 {{ member.email || 'Sin email registrado' }}</p>
            <p>⚖️ Peso: {{ member.peso ?? 'N/D' }} kg</p>
            <p>📏 Estatura: {{ member.estatura ?? 'N/D' }} cm</p>
            <p>🧬 Sexo: {{ member.sexo || 'N/D' }}</p>
            <p>🩺 Antecedentes: {{ member.medical_history || 'Ninguno' }}</p>

            <!-- Acciones -->
            <div class="pt-2 flex gap-3">
              <router-link
                :to="{ name: 'MemberDetail', params: { id: member.id } }"
                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
              >
                Ver detalle
              </router-link>

          <!-- Botón de WhatsApp -->
        <a
      :href="`https://wa.me/57${member.phone}`"
      target="_blank"
      rel="noopener noreferrer"
      class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
      v-if="member.phone"
    >
      <svg
        class="w-4 h-4"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M20.52 3.48A11.89 11.89 0 0 0 12 0a11.9 11.9 0 0 0-10.1 17.94L0 24l6.26-1.89A11.9 11.9 0 0 0 12 24a11.87 11.87 0 0 0 8.52-3.48A11.87 11.87 0 0 0 24 12a11.87 11.87 0 0 0-3.48-8.52ZM12 22a9.93 9.93 0 0 1-5.07-1.38l-.36-.21-3.72 1.12 1.13-3.61-.24-.37A10 10 0 1 1 22 12a9.94 9.94 0 0 1-10 10Zm5.17-7.38c-.28-.14-1.66-.82-1.91-.92s-.44-.14-.63.14-.73.92-.9 1.11-.33.21-.61.07a8.18 8.18 0 0 1-2.4-1.47 9.08 9.08 0 0 1-1.66-2c-.17-.29 0-.45.13-.59s.29-.33.44-.49.19-.28.29-.46a.56.56 0 0 0 0-.53c-.14-.14-.63-1.51-.87-2.07s-.47-.45-.64-.46-.36 0-.55 0a1.06 1.06 0 0 0-.76.35 3.19 3.19 0 0 0-1 2.4 5.53 5.53 0 0 0 1.18 2.86 12.63 12.63 0 0 0 4.88 4.4 5.7 5.7 0 0 0 2.79.76 3.3 3.3 0 0 0 2.18-1.48 2.74 2.74 0 0 0 .19-1.48c-.08-.14-.25-.21-.53-.35Z"
        />
      </svg>
      WhatsApp
    </a>

 <!-- Botón de editar miembro -->
      <router-link
      :to="{ name: 'MemberEdit', params: { id: member.id } }"
      class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
    >
      Editar
    </router-link>

              <button class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de registro -->
<div
      v-if="modalAbierto"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white text-black w-full max-w-lg p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
        <h2 class="text-xl font-bold mb-4">Registrar nuevo cliente</h2>
        <form @submit.prevent="registrarMiembro">
          <!-- Nombre -->
          <input
            v-model="nuevoMiembro.name"
            type="text"
            required
            placeholder="Nombre"
            class="w-full mb-2 p-2 border rounded"
          />

          <!-- Email -->
          <input
            v-model="nuevoMiembro.email"
            type="email"
            required
            placeholder="Email"
            class="w-full mb-2 p-2 border rounded"
          />

          <!-- Teléfono -->
          <input
            v-model="nuevoMiembro.phone"
            type="text"
            required
            placeholder="Teléfono"
            class="w-full mb-2 p-2 border rounded"
          />

          <!-- Fecha de nacimiento -->
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
          <label class="block mb-1 text-sm">Estatura (m)</label>
          <input
            v-model.number="nuevoMiembro.estatura"
            type="number"
            step="0.01"
            min="0"
            placeholder="Ej. 1.70"
            class="w-full mb-2 p-2 border rounded"
          />

          <!-- Peso -->
          <label class="block mb-1 text-sm">Peso (kg)</label>
          <input
            v-model.number="nuevoMiembro.peso"
            type="number"
            step="0.1"
            min="0"
            placeholder="Ej. 70.5"
            class="w-full mb-2 p-2 border rounded"
          />

          <!-- Antecedentes médicos -->
          <label class="block mb-1 text-sm">Antecedentes médicos</label>
          <textarea
            v-model="nuevoMiembro.medical_history"
            rows="3"
            placeholder="Ej. Asma, diabetes..."
            class="w-full mb-4 p-2 border rounded"
          ></textarea>

          <!-- Botones -->
          <div class="flex justify-end gap-3">
            <button type="button" @click="cerrarModal" class="text-gray-600 px-4 py-2">Cancelar</button>
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
import api from '@/axios'
import Sidebar from '@/views/Sidebar.vue'

const members = ref([])
const loading = ref(true)
const busqueda = ref('')
const token = localStorage.getItem('token')
const detallesAbiertos = ref([])


const toggleDetalle = (id) => {
  if (detallesAbiertos.value.includes(id)) {
    detallesAbiertos.value = detallesAbiertos.value.filter(i => i !== id)
  } else {
    detallesAbiertos.value.push(id)
  }
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
    const { data } = await api.get('/members')
    members.value = data
  } catch (e) {
    console.error('Error al cargar miembros:', e)
  } finally {
    loading.value = false
  }
}

function formatearTelefono(numero) {
  // Asegura que el número esté en formato internacional sin espacios ni signos
  if (!numero) return '';
  let limpio = numero.toString().replace(/\D/g, '');
  if (!limpio.startsWith('57')) {
    limpio = '57' + limpio; // Asume código de país Colombia si no está
  }
  return limpio;
}


const cargarPlanes = async () => {
  try {
    const { data } = await api.get('/membershipPlan')
    planes.value = data
  } catch (e) {
    console.error('Error al cargar planes:', e)
  }
}

const registrarMiembro = async () => {
  try {
    const res = await api.post('/members', nuevoMiembro.value)
    const nuevoId = res.data.id

    // Si hay plan seleccionado y fecha, asignar membresía
    if (nuevaMembresia.value.plan_id && nuevaMembresia.value.start_date) {
      await api.post('/memberships', {
        member_id: nuevoId,
        plan_id: nuevaMembresia.value.plan_id,
        start_date: nuevaMembresia.value.start_date
      })
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


