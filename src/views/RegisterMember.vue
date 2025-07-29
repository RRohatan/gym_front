<template>
  <!-- Fondo oscuro que ocupa toda la pantalla -->
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">

    <!-- Caja del formulario blanca -->
    <div class="w-full max-w-xl bg-white p-6 rounded-xl shadow-lg">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Registrar nuevo miembro</h2>

      <form @submit.prevent="registerMember" class="space-y-4">
        <div>
          <label class="block font-medium text-gray-700 mb-1">Nombre</label>
          <input v-model="form.name" type="text" class="w-full border px-4 py-2 rounded" required />
        </div>

        <div>
          <label class="block font-medium text-gray-700 mb-1">Email</label>
          <input v-model="form.email" type="email" class="w-full border px-4 py-2 rounded" required />
        </div>

        <div>
          <label class="block font-medium text-gray-700 mb-1">Teléfono</label>
          <input v-model="form.phone" type="text" class="w-full border px-4 py-2 rounded" />
        </div>

        <div>
          <label class="block font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
          <input v-model="form.birth_date" type="date" class="w-full border px-4 py-2 rounded" />
        </div>

        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
          Registrar miembro
        </button>
        
      </form>

      <div v-if="successMessage" class="mt-4 p-3 rounded bg-green-100 text-green-800 border border-green-300">
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="mt-4 p-3 rounded bg-red-100 text-red-800 border border-red-300">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import dayjs from 'dayjs'

const form = ref({
  name: '',
  email: '',
  phone: '',
  birth_date: ''
})

const membership = ref({
  plan_id: '',
  start_date: '',
  end_date: '',
  status: 'active'
})

const planes = ref([])
const successMessage = ref('')
const errorMessage = ref('')

onMounted(async () => {
  try {
    const token = localStorage.getItem('token')

    const response = await axios.get('http://127.0.0.1:8000/api/membershipPlan', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    })
    planes.value = response.data
  } catch (err) {
    console.error('Error al cargar los planes', err)
  }
})

const traducir = (freq) => {
  const map = {
    daily: 'Diario',
    weekly: 'Semanal',
    biweekly: 'Quincenal',
    monthly: 'Mensual'
  }
  return map[freq] || freq
}

const calcularFechaFin = () => {
  const plan = planes.value.find(p => p.id === membership.value.plan_id)
  if (plan && membership.value.start_date) {
    const inicio = dayjs(membership.value.start_date)
    let fin = inicio

    switch (plan.frequency) {
      case 'daily': fin = inicio.add(1, 'day'); break
      case 'weekly': fin = inicio.add(1, 'week'); break
      case 'biweekly': fin = inicio.add(2, 'week'); break
      case 'monthly': fin = inicio.add(1, 'month'); break
    }

    membership.value.end_date = fin.format('YYYY-MM-DD')
  }
}

const registerMember = async () => {
  try {
    const token = localStorage.getItem('token')

    // Registrar miembro
    const res = await axios.post('http://127.0.0.1:8000/api/members', form.value, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    })

    const member = res.data

    // Si se eligió un plan, registrar membresía
    if (membership.value.plan_id && membership.value.start_date && membership.value.end_date) {
      await axios.post('http://127.0.0.1:8000/api/memberships', {
        member_id: member.id,
        plan_id: membership.value.plan_id,
        start_date: membership.value.start_date,
        end_date: membership.value.end_date,
        status: membership.value.status
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      })
    }

    successMessage.value = '✅ Miembro registrado exitosamente.'
    errorMessage.value = ''
    form.value = { name: '', email: '', phone: '', birth_date: '' }
    membership.value = { plan_id: '', start_date: '', end_date: '', status: 'active' }
  } catch (error) {
    successMessage.value = ''
    if (error.response && error.response.status === 422) {
      const errors = error.response.data.errors
      if (errors.email) {
        errorMessage.value = '❗Este correo electrónico ya está registrado.'
      } else {
        errorMessage.value = '❗Verifica los datos del formulario.'
      }
    } else {
      errorMessage.value = '❌ Error inesperado al registrar el miembro.'
    }
    console.error(error)
  }
}
</script>

