<template>
  <div
    class="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
  >
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-white">Editar Cliente</h2>
          <p class="mt-1 text-sm text-gray-300">
            Actualiza la información personal y médica del cliente.
          </p>
        </div>
        <router-link
          :to="{ name: 'Members' }"
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="-ml-1 mr-2 h-5 w-5 text-gray-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clip-rule="evenodd"
            />
          </svg>
          Volver
        </router-link>
      </div>

      <!-- Card -->
      <div class="bg-white shadow-xl rounded-2xl overflow-hidden text-gray-900">
        <form @submit.prevent="updateMember" class="p-6 sm:p-8 space-y-6">
          <!-- Section: Personal Info -->
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900 border-b pb-2 mb-4">
              Información Personal
            </h3>
            <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div class="sm:col-span-1">
                <label for="identification" class="block text-sm font-medium text-gray-700"
                  >Identificación</label
                >
                <div class="mt-1">
                  <input
                    id="identification"
                    v-model="form.identification"
                    type="text"
                    required
                    class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50"
                  />
                </div>
              </div>

              <div class="sm:col-span-1">
                <label for="name" class="block text-sm font-medium text-gray-700"
                  >Nombre Completo</label
                >
                <div class="mt-1">
                  <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    required
                    class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div class="sm:col-span-1">
                <label for="birth_date" class="block text-sm font-medium text-gray-700"
                  >Fecha de Nacimiento</label
                >
                <div class="mt-1">
                  <input
                    id="birth_date"
                    v-model="form.birth_date"
                    type="date"
                    class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div class="sm:col-span-1">
                <label for="sexo" class="block text-sm font-medium text-gray-700">Sexo</label>
                <div class="mt-1">
                  <select
                    id="sexo"
                    v-model="form.sexo"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option disabled value="">Selecciona una opción</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="no binario">No binario</option>
                    <option value="prefiere no decirlo">Prefiero no decirlo</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Section: Contact Info -->
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900 border-b pb-2 mb-4">Contacto</h3>
            <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div class="sm:col-span-1">
                <label for="phone" class="block text-sm font-medium text-gray-700">Teléfono</label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      class="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"
                      />
                    </svg>
                  </div>
                  <input
                    id="phone"
                    v-model="form.phone"
                    type="text"
                    class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="+1 (555) 987-6543"
                  />
                </div>
              </div>

              <div class="sm:col-span-1">
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      class="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
                      />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="ejemplo@correo.com"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Section: Physical Info -->
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900 border-b pb-2 mb-4">
              Datos Físicos & Médicos
            </h3>
            <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label for="peso" class="block text-sm font-medium text-gray-700">Peso (kg)</label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="peso"
                    v-model="form.peso"
                    type="number"
                    step="0.01"
                    class="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                  />
                  <div
                    class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
                  >
                    <span class="text-gray-500 sm:text-sm">kg</span>
                  </div>
                </div>
              </div>

              <div>
                <label for="estatura" class="block text-sm font-medium text-gray-700"
                  >Estatura (cm)</label
                >
                <div class="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="estatura"
                    v-model="form.estatura"
                    type="number"
                    step="1"
                    class="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0"
                  />
                  <div
                    class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
                  >
                    <span class="text-gray-500 sm:text-sm">cm</span>
                  </div>
                </div>
              </div>

              <div class="sm:col-span-2">
                <label for="medical_history" class="block text-sm font-medium text-gray-700"
                  >Antecedentes Médicos</label
                >
                <div class="mt-1">
                  <textarea
                    id="medical_history"
                    v-model="form.medical_history"
                    rows="3"
                    class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Alergias, lesiones previas, condiciones crónicas..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-5 border-t border-gray-200 flex justify-end gap-3">
            <router-link
              :to="{ name: 'Members' }"
              class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </router-link>
            <button
              type="submit"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="loading"
            >
              <svg
                v-if="loading"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ loading ? "Guardando..." : "Guardar Cambios" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/axios";
import Swal from "sweetalert2";

const route = useRoute();
const router = useRouter();

const memberId = route.params.id;
const form = ref({
  identification: "",
  name: "",
  birth_date: "",
  phone: "",
  email: "",
  peso: null,
  estatura: null,
  sexo: "",
  medical_history: "",
});

const loading = ref(false);

const fetchMember = async () => {
  try {
    const { data } = await api.get(`/members/${memberId}`);
    console.log("Datos del miembro obtenidos:", data);

    form.value = {
      identification: data.identification ?? "",
      name: data.name ?? "",
      birth_date: data.birth_date ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
      peso: data.peso ?? null,
      estatura: data.estatura ?? null,
      sexo: data.sexo ?? "",
      medical_history: data.medical_history ?? "",
    };
  } catch (error: any) {
    console.error("Error al obtener miembro:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo cargar la información del cliente.",
      confirmButtonText: "Volver",
    }).then(() => {
      router.push({ name: "Members" });
    });
  }
};

const updateMember = async () => {
  loading.value = true;
  try {
    await api.put(`/members/${memberId}`, form.value);

    await Swal.fire({
      icon: "success",
      title: "¡Actualizado!",
      text: "Cliente actualizado correctamente.",
      timer: 2000,
      showConfirmButton: false,
    });

    router.push({ name: "Members" });
  } catch (error: any) {
    console.error("Error al actualizar miembro:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Hubo un error al guardar los cambios. " + (error.response?.data?.message || ""),
    });
  } finally {
    loading.value = false;
  }
};

onMounted(fetchMember);
</script>
