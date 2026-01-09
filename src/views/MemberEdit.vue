
<template>
  <div class="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-black">
  <div class="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-6">
    <h2 class="text-xl font-bold mb-4">Editar Miembro</h2>

    <form @submit.prevent="updateMember" class="space-y-4">

      <div>
        <label class="block text-sm font-medium">Identificación</label>
        <input
          v-model="form.identification"
          type="text"
          class="w-full border rounded px-3 py-2 bg-gray-100"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium">Nombre</label>
        <input
          v-model="form.name"
          type="text"
          class="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label class="block text-sm font-medium">Fecha de Nacimiento</label>
        <input
          v-model="form.birth_date"
          type="date"
          class="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label class="block text-sm font-medium">Teléfono</label>
        <input
          v-model="form.phone"
          type="text"
          class="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label class="block text-sm font-medium">Email</label>
        <input
          v-model="form.email"
          type="email"
          class="w-full border rounded px-3 py-2"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium">Peso (kg)</label>
          <input
            v-model="form.peso"
            type="number"
            class="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label class="block text-sm font-medium">Estatura (cm)</label>
          <input
            v-model="form.estatura"
            type="number"
            class="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium">Sexo</label>
        <select v-model="form.sexo" class="w-full border rounded px-3 py-2">
          <option disabled value="">Selecciona una opción</option>
          <option value="masculino">Masculino</option>
          <option value="femenino">Femenino</option>
          <option value="no binario">No binario</option>
          <option value="prefiere no decirlo">Prefiero no decirlo</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium">Antecedentes médicos</label>
        <textarea
          v-model="form.medical_history"
          rows="3"
          class="w-full border rounded px-3 py-2"
        />
      </div>

      <div class="pt-4 flex gap-4">
        <button
          type="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          :disabled="loading"
        >
          {{ loading ? 'Guardando...' : 'Guardar cambios' }}
        </button>

        <router-link
          :to="{ name: 'Members' }"
          class="text-gray-600 hover:underline self-center"
        >
          Cancelar
        </router-link>
      </div>
    </form>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/axios'


const route = useRoute()
const router = useRouter()

const memberId = route.params.id
const form = ref({
 identification: '',
  name: '',
  birth_date: '',
  phone: '',
  email: '',
  peso: null,
  estatura: null,
  sexo: '',
  medical_history: ''
})

const loading = ref(false)

const fetchMember = async () => {
  try {
    const { data } = await api.get(`/members/${memberId}`)

    console.log('Datos del miembro obtenidos:', data);

    form.value = {
      identification: data.identification ?? '',
      name: data.name ?? '',
      birth_date: data.birth_date ?? '',
      phone: data.phone ?? '',
      email: data.email ?? '',
      peso: data.peso ?? null,
      estatura: data.estatura ?? null,
      sexo: data.sexo ?? '',
      medical_history: data.medical_history ?? ''
    }
  } catch (error) {
    console.error('Error al obtener miembro:', error)
    alert('No se pudo cargar la información del miembro.')
    router.push({ name: 'MemberEdit' })
  }
}

const updateMember = async () => {
  loading.value = true
  try {
    await api.put(`/members/${memberId}`, form.value)
    alert('Miembro actualizado correctamente.')
    router.push({ name: 'Members' })
  } catch (error) {
    console.error('Error al actualizar miembro:', error)
    alert('Hubo un error al guardar los cambios.')
  } finally {
    loading.value = false
  }
}

onMounted(fetchMember)
</script>
