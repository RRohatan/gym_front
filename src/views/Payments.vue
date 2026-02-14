<template>
  <div
    class="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
  >
    <div class="bg-white text-gray-800 shadow-xl rounded-2xl p-4 sm:p-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold">💰 Historial de Pagos</h1>
        <div class="flex flex-wrap gap-2 w-full sm:w-auto">
          <router-link
            to="/Menu"
            class="flex-1 sm:flex-none px-4 py-2 rounded-lg border-2 border-gray-800 bg-transparent text-gray-800 hover:bg-gray-100 transition-all font-semibold text-center"
          >
            🏠 Inicio
          </router-link>
          <button @click="openModal = true" class="btn btn-success flex-1 sm:flex-none">
            ➕ Registrar
          </button>
        </div>
      </div>

      <div
        class="bg-gray-50 p-4 rounded-xl mb-6 flex flex-col sm:flex-row items-end gap-3 border border-gray-100"
      >
        <div class="w-full sm:w-auto">
          <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Desde</label>
          <input
            type="date"
            v-model="filtros.startDate"
            class="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border text-sm"
          />
        </div>
        <div class="w-full sm:w-auto">
          <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Hasta</label>
          <input
            type="date"
            v-model="filtros.endDate"
            class="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border text-sm"
          />
        </div>

        <button
          @click="cargarHistorial"
          class="btn btn-primary w-full sm:w-auto justify-center"
          :disabled="loadingHistorial"
        >
          {{ loadingHistorial ? "⏳" : "🔍 Consultar" }}
        </button>
      </div>

      <div
        class="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 mb-6 rounded-r-lg shadow-sm flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left"
      >
        <span class="text-sm sm:text-lg font-semibold">💰 Total en rango:</span>
        <span
          class="text-xl sm:text-2xl font-bold bg-white px-4 py-1 rounded shadow-sm border border-green-100 w-full sm:w-auto"
        >
          {{ formatCurrency(totalHistorial) }}
        </span>
      </div>

      <div class="overflow-x-auto rounded-lg border border-gray-100 shadow-sm">
        <div v-if="loadingHistorial" class="text-center py-10">
          <p class="text-gray-500 animate-pulse">Cargando...</p>
        </div>

        <table v-else class="min-w-[600px] w-full bg-white text-sm">
          <thead class="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
            <tr>
              <th class="py-3 px-4 text-left">Cliente</th>
              <th class="py-3 px-4 text-left">Monto</th>
              <th class="py-3 px-4 text-left">Método</th>
              <th class="py-3 px-4 text-left">Fecha</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="pagos.length === 0">
              <td colspan="4" class="py-10 text-center text-gray-500 italic">Sin resultados.</td>
            </tr>
            <tr v-for="pago in pagos" :key="pago.id" class="hover:bg-gray-50 transition-colors">
              <td class="py-3 px-4 font-medium text-gray-900">
                {{ pago.paymentable?.member?.name || "—" }}
              </td>
              <td class="py-3 px-4 text-green-600 font-bold">{{ formatCurrency(pago.amount) }}</td>
              <td class="py-3 px-4">
                <span
                  class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs border border-gray-200 whitespace-nowrap"
                >
                  {{ pago.payment_method?.name }}
                </span>
              </td>
              <td class="py-3 px-4 text-gray-500 text-xs">{{ formatDate(pago.paid_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="openModal"
        class="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm"
      >
        <div
          class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto"
        >
          <h2 class="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Registrar Pago</h2>

          <form @submit.prevent="registrarPago" class="space-y-4">
            <div>
              <label class="block mb-1 text-xs font-bold text-gray-700 uppercase">Cliente</label>
              <input
                v-model="busqueda"
                type="text"
                placeholder="Buscar nombre..."
                class="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                autocomplete="off"
              />
              <ul
                v-if="miembrosFiltrados.length > 0"
                class="border rounded-lg bg-white mt-1 max-h-32 overflow-y-auto shadow-lg absolute w-64 z-10"
              >
                <li
                  v-for="miembro in miembrosFiltrados"
                  :key="miembro.id"
                  @click="seleccionarMiembro(miembro)"
                  class="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-0 text-xs"
                >
                  {{ miembro.name }}
                </li>
              </ul>
            </div>

            <div>
              <label class="block mb-1 text-xs font-bold text-gray-700 uppercase">Monto</label>
              <input
                v-model="nuevoPago.amount"
                placeholder="0"
                type="number"
                min="0"
                step="0.01"
                required
                class="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg"
              />
            </div>

            <div>
              <label class="block mb-1 text-xs font-bold text-gray-700 uppercase">Método</label>
              <select
                v-model="nuevoPago.payment_method_id"
                required
                class="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option disabled value="">Seleccionar...</option>
                <option v-for="m in metodosPago" :key="m.id" :value="m.id">{{ m.name }}</option>
              </select>
            </div>

            <div class="flex justify-end gap-2 pt-4 border-t mt-2">
              <button
                type="button"
                @click="cerrarModal"
                class="btn btn-secondary flex-1"
                :disabled="ProcesandoPago"
              >
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary flex-1" :disabled="ProcesandoPago">
                {{ ProcesandoPago ? "💾..." : "Guardar" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/axios";
import dayjs from "dayjs";
import Swal from "sweetalert2";
// --- ESTADO ---
const pagos = ref([]);
const miembros = ref([]);
const metodosPago = ref([]);
const openModal = ref(false);
const busqueda = ref("");
const totalHistorial = ref(0);
const loadingHistorial = ref(true);
const ProcesandoPago = ref(false);

const filtros = ref({
  startDate: dayjs().format("YYYY-MM-DD"),
  endDate: dayjs().format("YYYY-MM-DD"),
});

const nuevoPago = ref({ member_id: "", amount: "", payment_method_id: "" });

// --- FUNCIONES ---
const cargarHistorial = async () => {
  loadingHistorial.value = true;
  try {
    const params = new URLSearchParams({
      start_date: filtros.value.startDate,
      end_date: filtros.value.endDate,
    });
    const { data } = await api.get(`/payments/history?${params.toString()}`);
    pagos.value = data.historial;
    totalHistorial.value = data.total_ingresos;
  } catch (error) {
    console.error(error);

    // Manejo de errores de red
    if (!error.response) {
      if (!navigator.onLine) {
        Swal.fire({
          icon: "error",
          title: "Sin conexión a internet",
          text: "No se pudo cargar el historial. Verifica tu conexión.",
          confirmButtonColor: "#d33",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error de conexión",
          text: "No se pudo conectar con el servidor para cargar el historial.",
          confirmButtonColor: "#d33",
        });
      }
    }

    pagos.value = [];
    totalHistorial.value = 0;
  } finally {
    loadingHistorial.value = false;
  }
};

const cargarMiembros = async () => {
  try {
    const { data } = await api.get("/members");
    miembros.value = data;
  } catch (error) {
    console.error("Error cargando miembros:", error);
    // Los errores de red ya se manejan globalmente en axios.js
    // Solo registramos en consola para debugging
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "warning",
      title: "Error cargando lista de miembros",
      showConfirmButton: false,
      timer: 3000,
    });
  }
};
const cargarMetodos = async () => {
  try {
    const { data } = await api.get("/payment_methods");
    metodosPago.value = data;
  } catch (error) {
    console.error("Error cargando métodos de pago:", error);
    // Los errores de red ya se manejan globalmente en axios.js
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "warning",
      title: "Error cargando métodos de pago",
      showConfirmButton: false,
      timer: 3000,
    });
  }
};

const registrarPago = async () => {
  if (ProcesandoPago.value) return;
  try {
    ProcesandoPago.value = true;

    // 1. Buscamos la membresía para ver la deuda
    const { data: membership } = await api.get(
      `/memberships/by-member/${nuevoPago.value.member_id}`,
    );

    if (membership.outstanding_balance <= 0) {
      Swal.fire({
        icon: "info",
        title: "Sin saldo pendiente",
        text: "Este cliente no tiene saldo pendiente.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    // 2. Enviamos el pago INCLUYENDO EL ID DE LA MEMBRESÍA
    await api.post("/payments", {
      member_id: nuevoPago.value.member_id,
      amount: nuevoPago.value.amount,
      payment_method_id: nuevoPago.value.payment_method_id,
      membership_id: membership.id,
    });

    // 3. Verificamos si se reactivó (opcional, para feedback visual)
    const { data: updateMembership } = await api.get(
      `/memberships/by-member/${nuevoPago.value.member_id}`,
    );

    limpiarFormulario();
    openModal.value = false;
    await cargarHistorial();

    if (
      updateMembership.status === "active" &&
      (membership.status === "expired" || membership.status === "inactive_unpaid")
    ) {
      Swal.fire({
        icon: "success",
        title: "¡Pago registrado!",
        text: "Membresía reactivada exitosamente.",
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: "success",
        title: "¡Pago registrado!",
        text: "El pago se registró exitosamente.",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  } catch (error) {
    // Manejo de errores de red
    if (!error.response) {
      // Sin respuesta del servidor - error de red
      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        Swal.fire({
          icon: "warning",
          title: "Tiempo de espera agotado",
          html: `<p>El pago tardó demasiado tiempo en procesarse.</p>
                 <p class="text-sm mt-2"><strong>IMPORTANTE:</strong> Verifica si el pago se registró antes de intentar nuevamente.</p>`,
          confirmButtonColor: "#3085d6",
        });
      } else if (!navigator.onLine) {
        Swal.fire({
          icon: "error",
          title: "Sin conexión a internet",
          html: `<p>No se pudo procesar el pago porque no hay conexión a internet.</p>
                 <p class="text-sm mt-2">Por favor, verifica tu conexión y vuelve a intentar.</p>`,
          confirmButtonColor: "#d33",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error de conexión",
          html: `<p>No se pudo conectar con el servidor para procesar el pago.</p>
                 <p class="text-sm mt-2">Verifica tu conexión e intenta nuevamente.</p>`,
          confirmButtonColor: "#d33",
        });
      }
    } else {
      // Errores HTTP con respuesta
      const status = error.response.status;

      if (status === 404) {
        Swal.fire({
          icon: "error",
          title: "Membresía no encontrada",
          text: "Este miembro no tiene una membresía asociada.",
          confirmButtonColor: "#d33",
        });
      } else if (status === 422) {
        Swal.fire({
          icon: "warning",
          title: "Datos inválidos",
          text: error.response.data?.message || "Los datos del pago no son válidos.",
          confirmButtonColor: "#f39c12",
        });
      } else if (status >= 500) {
        Swal.fire({
          icon: "error",
          title: "Error del servidor",
          html: `<p>Ocurrió un error en el servidor al procesar el pago.</p>
                 <p class="text-sm mt-2"><strong>IMPORTANTE:</strong> Verifica si el pago se registró antes de intentar nuevamente.</p>`,
          confirmButtonColor: "#d33",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error al registrar pago",
          text: error.response?.data?.message || "No se pudo registrar el pago.",
          confirmButtonColor: "#d33",
        });
      }
    }
  } finally {
    ProcesandoPago.value = false;
  }
};
const limpiarFormulario = () => {
  busqueda.value = "";
  nuevoPago.value = { member_id: "", amount: "", payment_method_id: "" };
};
const cerrarModal = () => {
  openModal.value = false;
  limpiarFormulario();
};
const seleccionarMiembro = (miembro) => {
  nuevoPago.value.member_id = miembro.id;
  busqueda.value = `${miembro.name} - ${miembro.email}`;
};

const miembrosFiltrados = computed(() => {
  const term = busqueda.value.toLowerCase();
  if (!term) return [];
  return miembros.value.filter(
    (m) => m.name.toLowerCase().includes(term) || (m.email || "").toLowerCase().includes(term),
  );
});

const formatCurrency = (val) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(val);
const formatDate = (dateStr) => new Date(dateStr).toLocaleString("es-CO");

onMounted(() => {
  cargarHistorial();
  cargarMiembros();
  cargarMetodos();
});
</script>
