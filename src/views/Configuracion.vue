<template>
  <div
    class="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
  >
    <div class="">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 class="text-2xl sm:text-3xl font-bold ml-12 sm:ml-0 flex items-center gap-2">
          ⚙️ Configuración del Gimnasio
        </h1>
        <router-link to="/Menu" class="btn btn-dark"> 🏠 Volver al Inicio </router-link>
      </div>

      <div class="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-gray-800 animate-fade-in-up">
        <div class="border-b pb-4 mb-6">
          <h2 class="text-xl font-bold text-blue-900">Personalización de Bienvenida</h2>
          <p class="text-sm text-gray-500">
            Esta información se enviará automáticamente por correo a los nuevos clientes.
          </p>
        </div>

        <div v-if="loading" class="text-center py-10">
          <p class="text-blue-600 font-bold animate-pulse">Cargando configuración...</p>
        </div>

        <form v-else @submit.prevent="guardarConfiguracion" class="space-y-6">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              🕒 Horarios de Atención
            </label>
            <div class="relative">
              <textarea
                v-model="form.horarios"
                rows="3"
                class="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50"
                placeholder="Ej: Lunes a Viernes: 6:00 AM - 10:00 PM&#10;Sábados: 8:00 AM - 4:00 PM"
              ></textarea>
              <div class="absolute top-3 right-3 text-xl opacity-50">📅</div>
            </div>
            <p class="text-xs text-gray-500 mt-1">Aparecerá en el correo de bienvenida.</p>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              📜 Normas y Políticas
            </label>
            <div class="relative">
              <textarea
                v-model="form.politicas"
                rows="5"
                class="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50"
                placeholder="Ej: 1. Uso obligatorio de toalla.&#10;2. Ordenar las pesas al terminar.&#10;3. No ingresar alimentos."
              ></textarea>
              <div class="absolute top-3 right-3 text-xl opacity-50">⚖️</div>
            </div>
          </div>

          <div>
            <label
              class="block text-sm font-bold text-green-700 mb-2 uppercase tracking-wide flex items-center gap-2"
            >
              <span class="text-xl">📲</span> Enlace Grupo WhatsApp
            </label>
            <input
              v-model="form.url_grupo_whatsapp"
              type="url"
              class="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-green-50 text-green-800 font-medium"
              placeholder="https://chat.whatsapp.com/ExampleCode..."
            />
            <p class="text-xs text-gray-500 mt-1">
              Pega aquí el "Enlace de invitación" de tu grupo. Si lo dejas vacío, no aparecerá el
              botón en el correo.
            </p>
          </div>

          <div class="pt-6 border-t flex justify-end">
            <button
              type="submit"
              class="btn btn-primary px-8 py-3 text-lg shadow-lg hover:shadow-xl transition transform active:scale-95 flex items-center gap-2"
              :disabled="guardando"
            >
              <span v-if="guardando" class="animate-spin">🔄</span>
              {{ guardando ? "Guardando..." : "💾 Guardar Cambios" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/axios";
import Swal from "sweetalert2";

const loading = ref(true);
const guardando = ref(false);

const form = ref({
  horarios: "",
  politicas: "",
  url_grupo_whatsapp: "",
});

// Cargar la configuración actual al entrar
onMounted(async () => {
  try {
    // Usamos el endpoint que ya tienes en GimnasioController@show
    const { data } = await api.get("/gimnasio/config");

    // Rellenamos el formulario con lo que venga de la BD
    form.value.horarios = data.horarios || "";
    form.value.politicas = data.politicas || "";
    form.value.url_grupo_whatsapp = data.url_grupo_whatsapp || "";
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "No se pudo cargar la información del gimnasio", "error");
  } finally {
    loading.value = false;
  }
});

// Guardar cambios
const guardarConfiguracion = async () => {
  guardando.value = true;
  try {
    // Enviamos al endpoint que creaste en el paso anterior (Backend)
    const { data } = await api.put("/gimnasio/config", form.value);

    Swal.fire({
      title: "¡Guardado!",
      text: "La configuración de bienvenida ha sido actualizada.",
      icon: "success",
      confirmButtonColor: "#2563EB",
    });
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "Hubo un problema al guardar los cambios.", "error");
  } finally {
    guardando.value = false;
  }
};
</script>

<style scoped>
/* Animación suave de entrada */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out;
}
</style>
