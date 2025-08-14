<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-black p-4 sm:p-6"
  >
    <Sidebar />

    <div class="max-w-5xl mx-auto bg-white p-4 sm:p-8 rounded-2xl shadow-lg">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 class="text-2xl sm:text-3xl ml-7 font-bold text-gray-800">📋 Planes de Membresía</h1>

        <div class="flex flex-wrap ml-16 gap-4">
          <router-link
            to="/Menu"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow whitespace-nowrap"
          >
            🏠 Inicio
          </router-link>
          <button
            @click="openModal = true"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow whitespace-nowrap"
          >
            ➕ Nuevo Plan
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-gray-200 text-gray-700">
            <tr>
              <th class="py-2 px-4">Tipo</th>
              <th class="py-2 px-4">Frecuencia</th>
              <th class="py-2 px-4">Precio</th>
              <th class="py-2 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="plan in planes" :key="plan.id" class="border-b hover:bg-gray-50">
              <td class="py-2 px-4">
                {{ plan.membership_type.name }}
              </td>
              <td class="py-2 px-4">
                {{ traducirFrecuencia(plan.frequency) }}
              </td>
              <td class="py-2 px-4">${{ Number(plan.price).toFixed(2) }}</td>
              <td class="py-2 px-4">
                <button
                  @click="editarPlan(plan)"
                  class="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-lg shadow text-sm"
                >
                  ✏️ Editar
                </button>
                <button
    @click="eliminarPlan(plan.id)"
    class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg shadow text-sm"
  >
    🗑️ Eliminar
  </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal para crear nuevo plan -->
      <div
        v-if="openModal"
        class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4"
      >
        <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
          <h2 class="text-xl font-bold mb-4">Crear Nuevo Plan</h2>
          <form @submit.prevent="crearPlan" class="space-y-4">
            <div>
              <label class="block text-sm mb-1 font-medium">Tipo de Membresía</label>
              <select
                v-model="nuevoPlan.membership_type_id"
                class="w-full border rounded px-3 py-2"
                required
              >
                <option disabled value="">Seleccione un tipo</option>
                <option v-for="tipo in tipos" :key="tipo.id" :value="tipo.id">
                  {{ tipo.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm mb-1 font-medium">Frecuencia</label>
              <select
                v-model="nuevoPlan.frequency"
                class="w-full border rounded px-3 py-2"
                required
              >
                <option disabled value="">Seleccione frecuencia</option>
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quincenal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>

            <div>
              <label class="block text-sm mb-1 font-medium">Precio</label>
              <input
                v-model="nuevoPlan.price"
                type="number"
                min="0"
                step="0.01"
                class="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button type="button" @click="openModal = false" class="text-gray-600 px-4 py-2">
                Cancelar
              </button>
              <button
                type="submit"
                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal para editar plan -->
      <div
        v-if="editModal"
        class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4"
      >
        <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
          <h2 class="text-xl font-bold mb-4">Editar Plan</h2>
          <form @submit.prevent="actualizarPlan" class="space-y-4">
            <div>
              <label class="block text-sm mb-1 font-medium">Tipo de Membresía</label>
              <select
                v-model="planEditando.membership_type_id"
                class="w-full border rounded px-3 py-2"
                required
              >
                <option disabled value="">Seleccione un tipo</option>
                <option v-for="tipo in tipos" :key="tipo.id" :value="tipo.id">
                  {{ tipo.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm mb-1 font-medium">Frecuencia</label>
              <select
                v-model="planEditando.frequency"
                class="w-full border rounded px-3 py-2"
                required
              >
                <option disabled value="">Seleccione frecuencia</option>
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quincenal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>

            <div>
              <label class="block text-sm mb-1 font-medium">Precio</label>
              <input
                v-model="planEditando.price"
                type="number"
                min="0"
                step="0.01"
                class="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button type="button" @click="cerrarModalEdicion" class="text-gray-600 px-4 py-2">
                Cancelar
              </button>
              <button
                type="submit"
                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Actualizar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/axios";
import Sidebar from "@/views/Sidebar.vue";

const planes = ref([]);
const tipos = ref([]);
const openModal = ref(false);
const editModal = ref(false);
const mostrarModal = ref(false);
const miembros = ref([]);
const miembroSeleccionado = ref("");
const loading = ref(true);

const nuevoPlan = ref({
  membership_type_id: "",
  frequency: "",
  price: "",
});

const planEditando = ref({
  id: null,
  membership_type_id: "",
  frequency: "",
  price: "",
});


// Función para traducir frecuencia para mostrar en la tabla
const traducirFrecuencia = (freq) => {
  const mapa = {
    daily: "Diario",
    weekly: "Semanal",
    biweekly: "Quincenal",
    monthly: "Mensual",
  };
  return mapa[freq] || freq;
};

const cargarPlanes = async () => {
  const { data } = await api.get("/membershipPlan");
  planes.value = data;
};

const cargarTipos = async () => {
  const { data } = await api.get("/membershipType");
  tipos.value = data;
};

const crearPlan = async () => {
  try {
    const datosNuevoPlan = {
      membership_type_id: nuevoPlan.value.membership_type_id,
      frequency: nuevoPlan.value.frequency,
      price: parseFloat(nuevoPlan.value.price),
    };

    await api.post("/membershipPlan", datosNuevoPlan);
    openModal.value = false;
    nuevoPlan.value = { membership_type_id: "", frequency: "", price: "" };
    await cargarPlanes();
  } catch (error) {
    console.error("Error al crear el plan:", error);
  }
};

const editarPlan = (plan) => {
  planEditando.value = {
    id: plan.id,
    membership_type_id: plan.membership_type_id,
    frequency: plan.frequency,
    price: plan.price,
  };
  editModal.value = true;
};

const actualizarPlan = async () => {
  try {
    const datosActualizados = {
      membership_type_id: planEditando.value.membership_type_id,
      frequency: planEditando.value.frequency,
      price: parseFloat(planEditando.value.price),
    };

    await api.put(`/membershipPlan/${planEditando.value.id}`, datosActualizados);
    editModal.value = false;

    planEditando.value = { id: null, membership_type_id: "", frequency: "", price: "" };
    alert("Plan actualizado correctamente");
    await cargarPlanes();
  } catch (error) {
    console.error("Error al actualizar el plan:", error);
  }
};

function eliminarPlan(id) {
  if (confirm("¿Seguro que deseas eliminar este plan?")) {
    api.delete(`/membershipPlan/${id}`)
      .then(() => {
        planes.value = planes.value.filter(plan => plan.id !== id);
        alert("Plan eliminado correctamente.");
      })
      .catch(() => {
        alert("Error al eliminar el plan.");
      });
  }
}


const cerrarModalEdicion = () => {
  editModal.value = false;
  planEditando.value = { id: null, membership_type_id: "", frequency: "", price: "" };
};

const cerrarModal = () => {
  mostrarModal.value = false;
  miembroSeleccionado.value = "";
};

onMounted(async () => {
  try {
    await Promise.all([cargarPlanes(), cargarTipos()]);
  } catch (error) {
    console.error("Error al cargar datos:", error);
  } finally {
    loading.value = false;
  }
});
</script>
