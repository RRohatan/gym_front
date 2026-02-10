<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-black p-4 sm:p-6"
  >
    <div class="bg-white p-4 sm:p-8 rounded-2xl shadow-xl">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 class="text-2xl sm:text-3xl ml-7 font-bold text-gray-800">📋 Planes de Membresía</h1>

        <div class="flex flex-wrap ml-16 gap-4">
          <router-link to="/Menu" class="btn btn-dark"> 🏠 Inicio </router-link>
          <button @click="openModal = true" class="btn btn-success">➕ Nuevo Plan</button>
        </div>
      </div>

      <div class="overflow-x-auto rounded-lg border border-gray-100">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
            <tr>
              <th class="py-3 px-4">Tipo</th>
              <th class="py-3 px-4">Frecuencia</th>
              <th class="py-3 px-4">Precio</th>
              <th class="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="plan in planes" :key="plan.id" class="hover:bg-gray-50 transition-colors">
              <td class="py-3 px-4 font-medium">{{ plan.membership_type.name }}</td>
              <td class="py-3 px-4">
                <span
                  class="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100 font-semibold"
                >
                  {{ traducirFrecuencia(plan.frequency) }}
                </span>
              </td>
              <td class="py-3 px-4 font-mono text-green-700 font-bold">
                ${{ Number(plan.price).toLocaleString() }}
              </td>

              <td class="py-3 px-4 flex justify-center gap-2">
                <button @click="editarPlan(plan)" class="btn btn-indigo btn-sm">✏️ Editar</button>
                <button @click="eliminarPlan(plan.id)" class="btn btn-danger btn-sm">
                  🗑️ Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="openModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 backdrop-blur-sm"
      >
        <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
          <h2 class="text-xl font-bold mb-4 border-b pb-2">Crear Nuevo Plan</h2>
          <form @submit.prevent="crearPlan" class="space-y-4">
            <div>
              <label class="block text-sm mb-1 font-bold text-gray-700">Tipo de Membresía</label>
              <select
                v-model="nuevoPlan.membership_type_id"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                required
              >
                <option disabled value="">Seleccione un tipo</option>
                <option v-for="tipo in tipos" :key="tipo.id" :value="tipo.id">
                  {{ tipo.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm mb-1 font-bold text-gray-700">Frecuencia</label>
              <select
                v-model="nuevoPlan.frequency"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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
              <label class="block text-sm mb-1 font-bold text-gray-700">Precio</label>
              <input
                v-model="nuevoPlan.price"
                type="number"
                min="0"
                step="0.01"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t mt-2">
              <button type="button" @click="openModal = false" class="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">💾 Guardar</button>
            </div>
          </form>
        </div>
      </div>

      <div
        v-if="editModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 backdrop-blur-sm"
      >
        <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
          <h2 class="text-xl font-bold mb-4 border-b pb-2">Editar Plan</h2>
          <form @submit.prevent="actualizarPlan" class="space-y-4">
            <div>
              <label class="block text-sm mb-1 font-bold text-gray-700">Tipo de Membresía</label>
              <select
                v-model="planEditando.membership_type_id"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                required
              >
                <option disabled value="">Seleccione un tipo</option>
                <option v-for="tipo in tipos" :key="tipo.id" :value="tipo.id">
                  {{ tipo.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm mb-1 font-bold text-gray-700">Frecuencia</label>
              <select
                v-model="planEditando.frequency"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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
              <label class="block text-sm mb-1 font-bold text-gray-700">Precio</label>
              <input
                v-model="planEditando.price"
                type="number"
                min="0"
                step="0.01"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t mt-2">
              <button type="button" @click="cerrarModalEdicion" class="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">💾 Actualizar</button>
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
import Swal from "sweetalert2";

const planes = ref([]);
const tipos = ref([]);
const openModal = ref(false);
const editModal = ref(false);
const loading = ref(true);

const nuevoPlan = ref({ membership_type_id: "", frequency: "", price: "" });
const planEditando = ref({ id: null, membership_type_id: "", frequency: "", price: "" });

const traducirFrecuencia = (freq) => {
  const mapa = { daily: "Diario", weekly: "Semanal", biweekly: "Quincenal", monthly: "Mensual" };
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
    await api.post("/membershipPlan", {
      membership_type_id: nuevoPlan.value.membership_type_id,
      frequency: nuevoPlan.value.frequency,
      price: parseFloat(nuevoPlan.value.price),
    });
    openModal.value = false;
    nuevoPlan.value = { membership_type_id: "", frequency: "", price: "" };
    await cargarPlanes();
  } catch (error) {
    console.error("Error:", error);
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
    await api.put(`/membershipPlan/${planEditando.value.id}`, {
      membership_type_id: planEditando.value.membership_type_id,
      frequency: planEditando.value.frequency,
      price: parseFloat(planEditando.value.price),
    });
    editModal.value = false;
    planEditando.value = { id: null, membership_type_id: "", frequency: "", price: "" };
    Swal.fire({
      icon: "success",
      title: "Actualizado",
      text: "Plan actualizado correctamente",
      timer: 1500,
      showConfirmButton: false,
    });
    await cargarPlanes();
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Hubo un error al actualizar el plan.",
    });
  }
};

const eliminarPlan = (id) => {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "No podrás revertir esto.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, eliminarlo",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      api
        .delete(`/membershipPlan/${id}`)
        .then(() => {
          planes.value = planes.value.filter((plan) => plan.id !== id);
          Swal.fire({
            title: "¡Eliminado!",
            text: "El plan ha sido eliminado.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        })
        .catch(() => {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Hubo un error al eliminar el plan.",
          });
        });
    }
  });
};

const cerrarModalEdicion = () => {
  editModal.value = false;
  planEditando.value = { id: null, membership_type_id: "", frequency: "", price: "" };
};

onMounted(async () => {
  try {
    await Promise.all([cargarPlanes(), cargarTipos()]);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    loading.value = false;
  }
});
</script>
