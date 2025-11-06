<template>
  <div
    class="w-screen min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-4"
    style="background-image: url('/img/fondo_sin_letra.png')"
  >
    <!-- Logo/Nombre del Gimnasio -->
    <div class="flex justify-center items-center mb-6">
      <h1 class="text-white text-4xl md:text-6xl font-extrabold tracking-wider animate-logo">
        {{ gimnasio.nombre || 'COSMOGYM' }}
      </h1>
    </div>

    <!-- Formulario -->
    <div class="flex justify-center items-center w-full">
      <div class="bg-white shadow-lg rounded-2xl p-6 md:p-10 w-full max-w-lg">

        <!-- Estado de éxito -->
        <div v-if="successMessage" class="text-center p-4 bg-green-100 text-green-700 rounded-lg">
          <h2 class="text-2xl font-bold mb-2">¡Registro Exitoso!</h2>
          <p>{{ successMessage }}</p>
        </div>

        <!-- Estado de carga o formulario -->
        <div v-else>
          <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Formulario de Inscripción</h2>

          <div v-if="loading" class="text-center text-gray-600">
            Cargando planes...
          </div>

          <form v-else @submit.prevent="handleSubmit" class="space-y-4 max-h-[60vh] overflow-y-auto pr-2">

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-600 text-sm mb-1">Nombre Completo</label>
                <input v-model="form.name" type="text" class="input-field" required />
              </div>
              <div>
                <label class="block text-gray-600 text-sm mb-1">Identificación (Cédula)</label>
                <input v-model="form.identification" type="text" class="input-field" required />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-600 text-sm mb-1">Correo</label>
                <input v-model="form.email" type="email" class="input-field" />
              </div>
              <div>
                <label class="block text-gray-600 text-sm mb-1">Teléfono</label>
                <input v-model="form.phone" type="tel" class="input-field" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-600 text-sm mb-1">Fecha de Nacimiento</label>
                <input v-model="form.birth_date" type="date" class="input-field" required />
              </div>
              <div>
                <label class="block text-gray-600 text-sm mb-1">Sexo</label>
                <select v-model="form.sexo" class="input-field" required>
                  <option value="" disabled>Seleccione...</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="no_binario">No binario</option>
                  <option value="otro">Otro</option>
                  <option value="preferir_no_decir">Prefiero no decir</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-600 text-sm mb-1">Peso (kg)</label>
                <input v-model.number="form.peso" type="number" step="0.1" class="input-field" placeholder="Ej. 70.5" />
              </div>
              <div>
                <label class="block text-gray-600 text-sm mb-1">Estatura (m)</label>
                <input v-model.number="form.estatura" type="number" step="0.01" class="input-field" placeholder="Ej. 1.75" />
              </div>
            </div>

            <!-- CAMPO 'OBJETIVO' ELIMINADO -->

            <div>
              <label class="block text-gray-600 text-sm mb-1">Plan de Membresía</label>
              <select v-model="form.plan_id" class="input-field" required>
                <option value="" disabled>Seleccione el plan que desea</option>
                <!-- Typescript ahora sabe qué es 'plan.membership_type' -->
                <option v-for="plan in planes" :key="plan.id" :value="plan.id">
                  {{ plan.membership_type.name }} ({{ traducirFrecuencia(plan.frequency) }}) - {{ formatCurrency(plan.price) }}
                </option>
              </select>
            </div>

            <div v-if="errorMessage" class="text-red-600 text-sm text-center">
              {{ errorMessage }}
            </div>

            <button
              type="submit"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-200"
              :disabled="loading"
            >
              {{ loading ? 'Registrando...' : 'Inscribirme' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeScale {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}
.animate-logo {
  animation: fadeScale 1.2s ease-out forwards;
  text-shadow: 0 2px 10px rgba(255, 0, 0, 0.4);
}
body {
  margin: 0;
  background-color: black;
  overflow-x: hidden;
}
.input-field {
  @apply w-full px-4 py-2 border rounded-lg focus:outline-none text-black focus:ring-2 focus:ring-blue-400;
}
</style>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/axios' // Usamos la instancia de Axios
import Swal from 'sweetalert2'

// --- INICIO DE CORRECCIÓN DE TIPOS ---

// 1. Definir los tipos de datos que esperamos de la API
interface GimnasioInfo {
  id: number;
  nombre: string;
}

interface MembershipType {
  id: number;
  name: string;
  description: string | null;
}

interface Plan {
  id: number;
  gym_id: number;
  membership_type_id: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  price: number;
  membership_type: MembershipType; // Objeto anidado
}

// 2. Aplicar los tipos a las variables reactivas
const route = useRoute()
const gimnasioId = ref(route.params.gimnasioId as string) // Especificar que es string

const gimnasio = ref<GimnasioInfo>({ id: 0, nombre: '' }) // Aplicar tipo
const planes = ref<Plan[]>([]) // Aplicar tipo (Array de Plan)
const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')

// 3. Quitar 'objetivo_entrenamiento' del formulario
const form = reactive({
  name: '',
  identification: '',
  email: '',
  phone: '',
  birth_date: '',
  sexo: '',
  peso: null as number | null, // Especificar tipo
  estatura: null as number | null, // Especificar tipo
  plan_id: '',
})

// --- FIN DE CORRECCIÓN DE TIPOS ---


// Cargar planes al montar
onMounted(async () => {
  if (!gimnasioId.value) {
    errorMessage.value = "ID del gimnasio no encontrado."
    loading.value = false
    return
  }
  try {
    // Definir el tipo de la respuesta esperada
    const { data } = await api.get<{ gimnasio: GimnasioInfo, planes: Plan[] }>(`/public/plans/${gimnasioId.value}`)
    gimnasio.value = data.gimnasio
    planes.value = data.planes
  } catch (error) {
    console.error("Error al cargar planes:", error)
    errorMessage.value = "No se pudieron cargar los planes del gimnasio."
  } finally {
    loading.value = false
  }
})

// Enviar formulario
const handleSubmit = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const { data } = await api.post(`/public/register/${gimnasioId.value}`, form)

    // Mostrar mensaje de éxito
    successMessage.value = data.message

    Swal.fire({
      title: '¡Registro Exitoso!',
      text: data.message,
      icon: 'success',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#2563EB',
    })

  } catch (error: any) {
    if (error.response && error.response.status === 422) {
      // Manejar errores de validación
      const errors = error.response.data.errors
      if (errors.identification) {
        errorMessage.value = "La identificación ya está registrada."
      } else if (errors.email) {
        errorMessage.value = "El correo ya está registrado."
      } else {
        errorMessage.value = "Por favor, revise todos los campos."
      }
    } else {
      errorMessage.value = "Ocurrió un error inesperado. Intente de nuevo."
    }
    console.error("Error en el registro:", error)
  } finally {
    loading.value = false
  }
}

// Funciones de formato (TypeScript las entiende)
const traducirFrecuencia = (f: string) => {
  const map: { [key: string]: string } = {
    daily: 'Diario',
    weekly: 'Semanal',
    biweekly: 'Quincenal',
    monthly: 'Mensual',
  }
  return map[f] || f
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
}
</script>
