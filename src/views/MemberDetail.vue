<template>
  <div class="p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
    <div class="max-w-3xl mx-auto bg-white text-gray-800 rounded-2xl shadow-lg p-8 space-y-6">

      <!-- Título -->
      <h2 class="text-3xl font-bold text-gray-900 mb-4 border-b pb-2">
        👤 Detalle del cliente
      </h2>

      <!-- Cargando -->
      <div v-if="loading" class="text-gray-500">
        Cargando datos del cliente...
      </div>

      <!-- Datos del miembro -->
      <div v-else-if="member">
        <!-- 📌 Información personal -->
        <section>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">📝 Información básica</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <p><span class="font-semibold">Nombre:</span> {{ member.name }}</p>
            <p><span class="font-semibold">Email:</span> {{ member.email || '—' }}</p>
            <p><span class="font-semibold">Teléfono:</span> {{ member.phone || '—' }}</p>
            <p><span class="font-semibold">Fecha de nacimiento:</span> {{ member.birth_date || '—' }}</p>
          </div>
        </section>

        <!-- 🧍‍♂️ Información física -->
        <section class="mt-6 text-gray-700">
          <h3 class="text-xl font-semibold text-gray-800 mb-2">🩺 Información Física</h3>
          <p><span class="font-semibold">Edad:</span> {{ calcularEdad(member.birth_date) }} años</p>
          <p><span class="font-semibold">Sexo:</span> {{ member.sexo || '—' }}</p>
          <p><span class="font-semibold">Estatura:</span> {{ member.estatura ? (member.estatura > 3 ? (member.estatura / 100).toFixed(2) : member.estatura) + ' m' : '—' }}</p>
          <p><span class="font-semibold">Peso:</span> {{ member.peso ? member.peso + ' kg' : '—' }}</p>
          <p><span class="font-semibold">IMC:</span> {{ calcularIMC(member.peso, member.estatura) }}</p>
          <p><span class="font-semibold">Clasificación según la OMS:</span> {{ clasificarIMC(calcularIMC(member.peso, member.estatura)) }}</p>
        </section>

        <!-- 💊 Antecedentes médicos -->
        <section class="mt-6">
          <h3 class="text-xl font-semibold text-gray-800 mb-2">🏥 Antecedentes médicos</h3>
          <div class="bg-gray-100 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
            {{ member.medical_history || 'No hay antecedentes médicos registrados.' }}
          </div>
        </section>

        <!-- 💳 Membresía activa -->
        <section v-if="member.memberships?.length" class="mt-6">
          <h3 class="text-xl font-semibold text-gray-800 mb-2">🏋️ Membresía Activa</h3>
          <div class="p-4 bg-blue-50 rounded-lg space-y-2 text-sm">
            <p><span class="font-semibold">Plan:</span> {{ traducirFrecuencia(member.memberships[0].plan?.frequency) }}</p>
            <p><span class="font-semibold">Estado:</span> {{ traducirEstado(member.memberships[0].status) }}</p>
            <p><span class="font-semibold">Inicio:</span> {{ member.memberships[0].start_date }}</p>
            <p><span class="font-semibold">Fin:</span> {{ member.memberships[0].end_date }}</p>
            <p><span class="font-semibold">Precio:</span> {{ member.memberships[0].plan?.price }} COP</p>
          </div>
        </section>
      </div>

      <!-- Si no hay datos -->
      <div v-else class="text-red-500">
        Cliente no encontrado.
      </div>

      <!-- Botón volver -->
      <router-link
        to="/members"
        class="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
      >
        ← Volver a Clientes
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/axios'
import dayjs from 'dayjs'

const route = useRoute()
const member = ref(null)
const loading = ref(true)

onMounted(async () => {
  const memberId = route.params.id

  try {
    const response = await api.get(`/members/${memberId}`)
    member.value = response.data
  } catch (error) {
    console.error('Error al obtener el detalle del miembro:', error)
  } finally {
    loading.value = false
  }
})

const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return '—'
  return dayjs().diff(dayjs(fechaNacimiento), 'year')
}

const calcularIMC = (peso, estatura) => {
  // 1. Validamos que existan datos
  if (!peso || !estatura) return '—'

  // 2. Aseguramos que sean números (por si vienen como texto de la BD)
  const pesoKg = parseFloat(peso)
  let alturaMetros = parseFloat(estatura)

  // 3. DETECTOR DE ERRORES:
  // Si la altura es mayor a 3 (nadie mide 3 metros), asumimos que son CM y lo dividimos por 100
  if (alturaMetros > 3) {
    alturaMetros = alturaMetros / 100
  }

  // 4. Calculamos ahora sí con metros
  const imc = pesoKg / (alturaMetros * alturaMetros)

  return imc.toFixed(2)
}

const clasificarIMC = (imc) => {
  if (!imc || isNaN(imc)) return '—'
  if (imc < 18.5) return 'Bajo peso'
  if (imc < 25) return 'Normal'
  if (imc < 30) return 'Sobrepeso'
  if (imc < 35) return 'Obesidad grado I'
  if (imc < 40) return 'Obesidad grado II'
  return 'Obesidad grado III (mórbida)'
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

const traducirEstado = (estado) => {
  switch (estado) {
    case 'active': return 'Activa'
    case 'inactive': return 'Inactiva'
    case 'cancelled': return 'Cancelada'
    default: return estado
  }
}

</script>


