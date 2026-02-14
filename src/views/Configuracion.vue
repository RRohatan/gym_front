<template>
  <div
    class="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
  >
    <div class="">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          ⚙️ Configuración del Gimnasio
        </h1>
        <router-link
          to="/Menu"
          class="flex-1 sm:flex-none px-4 py-2 rounded-lg border-2 border-white bg-transparent text-white hover:bg-white/10 transition-all font-semibold text-center"
        >
          🏠 Volver al Inicio
        </router-link>
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

          <!-- SECCIÓN CÓDIGO QR -->
          <div class="border-t pt-6" v-if="qrImageUrl">
            <h3 class="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
              🏁 Código QR de Registro
            </h3>
            <p class="text-sm text-gray-500 mb-4">
              Imprime este código y colócalo en la recepción. Los clientes podrán escanearlo para
              registrarse ellos mismos.
            </p>

            <div
              class="flex flex-col sm:flex-row items-center gap-6 bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300"
            >
              <div class="bg-white p-2 rounded shadow-sm">
                <img
                  :src="qrImageUrl"
                  alt="Código QR de Registro"
                  class="w-40 h-40 object-contain"
                />
              </div>

              <div class="flex flex-col gap-3 w-full sm:w-auto">
                <button
                  @click="descargarImagen"
                  class="btn btn-dark flex items-center justify-center gap-2 text-sm"
                >
                  📥 Descargar Imagen
                </button>
                <button
                  @click="imprimirQR"
                  class="btn btn-primary flex items-center justify-center gap-2 text-sm"
                >
                  🖨️ Imprimir / Guardar PDF
                </button>
                <a
                  :href="registrationUrl"
                  target="_blank"
                  class="text-blue-600 underline text-sm text-center mt-2"
                >
                  Probar enlace de registro
                </a>
              </div>
            </div>
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

const qrImageUrl = ref("");
const registrationUrl = ref("");

// Cargar la configuración actual al entrar
onMounted(async () => {
  try {
    // 1. Obtener ID del gimnasio del usuario logueado
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      // Asumiendo que el usuario tiene gimnasio_id
      const gimnasioId = user.gimnasio_id;

      if (gimnasioId) {
        const baseUrl = window.location.origin;
        registrationUrl.value = `${baseUrl}/public-register/${gimnasioId}`;
        // Generar QR usando API confiable
        qrImageUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(registrationUrl.value)}&margin=10`;
      }
    }
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
// Descargar imagen forzando descarga
const descargarImagen = async () => {
  if (!qrImageUrl.value) return;
  try {
    const response = await fetch(qrImageUrl.value);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qr-registro-gimnasio.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error al descargar imagen:", error);
    // Fallback
    window.open(qrImageUrl.value, "_blank");
  }
};

// Imprimir QR (que permite guardar como PDF)
const imprimirQR = () => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return alert("Por favor, permite ventanas emergentes.");

  const htmlContent = `
    <html>
      <head>
        <title>Código QR de Registro</title>
        <style>
          body { font-family: sans-serif; text-align: center; padding: 50px; }
          .container { border: 2px dashed #333; display: inline-block; padding: 40px; border-radius: 20px; }
          h1 { color: #2563EB; margin-bottom: 10px; }
          p { color: #666; font-size: 18px; margin-bottom: 30px; }
          img { width: 300px; height: 300px; }
          .footer { margin-top: 20px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>¡Regístrate Aquí!</h1>
          <p>Escanea este código para crear tu cuenta en el gimnasio.</p>
          <img src="${qrImageUrl.value}" />
          <div class="footer">CosmoGym - Registro de Clientes</div>
        </div>
        <script>
          window.onload = function() { window.print(); window.onafterprint = function(){ window.close(); } };
        <\/script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
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
