<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white text-black w-full max-w-lg p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
      <h2 class="text-xl font-bold mb-4">Registrar nuevo cliente</h2>

      <form @submit.prevent="registrar">
        <input v-model="form.name" type="text" required placeholder="Nombre" class="w-full mb-2 p-2 border rounded" />
        <input v-model="form.identification" type="text" required placeholder="Identificación (Cédula)" class="w-full mb-2 p-2 border rounded" />
        <input v-model="form.email" type="email" placeholder="Email (Opcional)" class="w-full mb-2 p-2 border rounded" />
        <input v-model="form.phone" type="text" placeholder="Teléfono (Opcional)" class="w-full mb-2 p-2 border rounded" />

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block mb-1 text-sm">Fecha nacimiento</label>
            <input v-model="form.birth_date" type="date" class="w-full mb-2 p-2 border rounded" />
          </div>
          <div>
            <label class="block mb-1 text-sm">Sexo</label>
            <select v-model="form.sexo" class="w-full mb-2 p-2 border rounded">
              <option disabled value="">Seleccione...</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="no binario">No binario</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block mb-1 text-sm">Estatura (m)</label>
            <input v-model.number="form.estatura" type="number" step="0.01" min="0" placeholder="Ej. 1.70" class="w-full mb-2 p-2 border rounded" />
          </div>
          <div>
            <label class="block mb-1 text-sm">Peso (kg)</label>
            <input v-model.number="form.peso" type="number" step="0.1" min="0" placeholder="Ej. 70.5" class="w-full mb-2 p-2 border rounded" />
          </div>
        </div>

        <label class="block mb-1 text-sm">Antecedentes médicos (Opcional)</label>
        <textarea v-model="form.medical_history" rows="2" placeholder="Ej. Asma, diabetes..." class="w-full mb-4 p-2 border rounded"></textarea>

        <div class="border-t pt-4 bg-gray-50 p-3 rounded mb-4">
          <label class="block mb-1 text-sm font-semibold text-blue-800">Asignar Plan Inicial (Opcional)</label>
          <p class="text-xs text-gray-500 mb-2">Se creará la membresía pendiente de pago.</p>
          <select v-model="form.plan_id" class="w-full p-2 border rounded border-blue-200">
            <option value="">-- Solo registrar cliente --</option>
            <option v-for="plan in planes" :key="plan.id" :value="plan.id">
              {{ plan.name }}
            </option>
          </select>
        </div>

        <div class="flex justify-end gap-3">
          <button type="button" @click="$emit('close')" class="text-gray-600 px-4 py-2">Cancelar</button>
          <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold" :disabled="loading">
            {{ loading ? 'Guardando...' : 'Guardar Cliente' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import api from '@/axios'
import Swal from 'sweetalert2'

const props = defineProps({
  show: Boolean,
  planes: Array
})

const emit = defineEmits(['close', 'saved'])
const loading = ref(false)

const form = reactive({
  name: "", identification: "", email: "", phone: "", birth_date: "",
  medical_history: "", sexo: "masculino", peso: null, estatura: null, plan_id: "",
})

const registrar = async () => {
  loading.value = true
  try {
    const { data: nuevoCliente } = await api.post("/members", form)

    // Emitimos el evento 'saved' con el cliente creado y si seleccionó plan
    emit('saved', { client: nuevoCliente, hasPlan: !!form.plan_id })

    // Resetear formulario
    Object.assign(form, {
      name: "", identification: "", email: "", phone: "", birth_date: "",
      medical_history: "", sexo: "masculino", peso: null, estatura: null, plan_id: "",
    })

  } catch (e) {
    console.error(e)
    if (e.response && e.response.status === 422) {
      Swal.fire('Error de validación', 'Verifica si la identificación o email ya existen.', 'error')
    } else {
      Swal.fire('Error', 'No se pudo registrar el cliente.', 'error')
    }
  } finally {
    loading.value = false
  }
}
</script>
