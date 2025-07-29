
<template>
  <div class="p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-black">
       <Sidebar />
    <div class="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
      <div class="flex justify-between items-center mb-6">

        <h1 class="text-3xl font-bold text-gray-800">📋 Planes de Membresía</h1>
         <Sidebar />
        <div class="flex gap-4">
         <router-link
            to="/Menu"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
          >
            🏠 Inicio
          </router-link>
    <button @click="openModal = true" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow">
          ➕ Nuevo Plan
        </button>
        </div>

      </div>

      <table class="min-w-full text-left">
        <thead class="bg-gray-200 text-gray-700">
          <tr>
            <th class="py-2 px-4">Tipo</th>
            <th class="py-2 px-4">Frecuencia</th>
            <th class="py-2 px-4">Precio</th>

          </tr>
        </thead>
        <tbody>
          <tr v-for="plan in planes" :key="plan.id" class="border-b">
            <td class="py-2 px-4">{{ plan.membership_type.name }}</td>
            <td class="py-2 px-4">{{ traducirFrecuencia(plan.frequency) }}</td>
            <td class="py-2 px-4">${{ Number(plan.price).toFixed(2) }}</td>

          </tr>
        </tbody>
      </table>

      <!-- Modal -->
      <div v-if="openModal" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 class="text-xl font-bold mb-4">Crear Nuevo Plan</h2>
          <form @submit.prevent="crearPlan">
            <div class="mb-4">
              <label class="block text-sm mb-1">Tipo de Membresía</label>
              <select v-model="nuevoPlan.membership_type_id" class="w-full border rounded px-3 py-2" required>
                <option disabled value="">Seleccione un tipo</option>
                <option v-for="tipo in tipos" :key="tipo.id" :value="tipo.id">{{ tipo.name }}</option>
              </select>
            </div>

            <div class="mb-4">
              <label class="block text-sm mb-1">Frecuencia</label>
              <select v-model="nuevoPlan.frequency" class="w-full border rounded px-3 py-2" required>
                <option disabled value="">Seleccione frecuencia</option>
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quincenal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>

            <div class="mb-4">
              <label class="block text-sm mb-1">Precio</label>
              <input v-model="nuevoPlan.price" type="number" min="0" step="0.01" class="w-full border rounded px-3 py-2" required />
            </div>

            <div class="flex justify-end space-x-2">
              <button type="button" @click="openModal = false" class="text-gray-600 px-4 py-2">Cancelar</button>
              <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Sidebar from '@/views/Sidebar.vue'

const planes = ref([])
const tipos = ref([])
const openModal = ref(false)
const mostrarModal = ref(false)
const miembros = ref([])
const miembroSeleccionado = ref('')
const loading = ref(true)

const nuevoPlan = ref({
  membership_type_id: '',
  frequency: '',
  price: ''
})

const token = localStorage.getItem('token')

// funcion para traducir la frecuencia del tipo de membresia
const traducirFrecuencia = (freq) => {
  const mapa = {
    daily: 'Diario',
    weekly: 'Semanal',
    biweekly: 'Quincenal',
    monthly: 'Mensual'
  }
  return mapa[freq] || '-'
}


const cargarPlanes = async () => {
  const { data } = await axios.get('http://127.0.0.1:8000/api/membershipPlan', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    }
  })
  planes.value = data
}

const cargarTipos = async () => {
  const { data } = await axios.get('http://127.0.0.1:8000/api/membershipType', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    }
  })
  tipos.value = data
}

const crearPlan = async () => {
  try {
    console.log('Datos a enviar:', nuevoPlan.value)
    await axios.post('http://127.0.0.1:8000/api/membershipPlan', nuevoPlan.value, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    })
    openModal.value = false
    nuevoPlan.value = { membership_type_id: '', frequency: '', price: '' }
    await cargarPlanes()
  } catch (error) {
    console.error('Error al crear el plan:', error)
  }
}

const cerrarModal = () => {
  mostrarModal.value = false
  miembroSeleccionado.value = ''
}


onMounted(async () => {
  if (!token) {
    console.error('Token no encontrado en LocalStorage')
    return
  }

  try {
    await Promise.all([
      cargarPlanes(),
      cargarTipos(),
    ])
  } catch (error) {
    console.error('Error al cargar datos:', error)
  } finally {
    loading.value = false
  }
})
</script>

