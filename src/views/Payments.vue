<template>
  <div class="page-layout">
    <BaseCard title="Historial de Pagos" subtitle="Consulta y registra pagos" class="space-y-6">
      <template #actions>
        <router-link to="/Menu" class="btn btn-secondary flex-1 sm:flex-none">
          Inicio
        </router-link>
        <BaseButton variant="success" class="flex-1 sm:flex-none" @click="openModal = true">
          Registrar pago
        </BaseButton>
      </template>

      <div
        class="bg-gray-50 p-4 rounded-xl flex flex-col sm:flex-row items-end gap-3 border border-gray-100"
      >
        <BaseInput
          v-model="filtros.startDate"
          type="date"
          label="Desde"
          class="w-full sm:w-auto"
        />
        <BaseInput
          v-model="filtros.endDate"
          type="date"
          label="Hasta"
          class="w-full sm:w-auto"
        />
        <BaseButton
          variant="primary"
          :loading="loadingHistorial"
          class="w-full sm:w-auto"
          @click="cargarHistorial"
        >
          Consultar
        </BaseButton>
      </div>

      <div
        class="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-r-lg shadow-sm flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left"
      >
        <span class="text-sm sm:text-lg font-semibold">Total en rango:</span>
        <span
          class="text-xl sm:text-2xl font-semibold bg-white px-4 py-1 rounded shadow-sm border border-emerald-100 w-full sm:w-auto"
        >
          {{ formatCurrency(totalHistorial) }}
        </span>
      </div>

      <div class="table-wrap">
        <div v-if="loadingHistorial" class="text-center py-10">
          <p class="text-gray-500 animate-pulse">Cargando...</p>
        </div>

        <table v-else class="min-w-[600px] w-full bg-white text-sm">
          <thead class="table-head">
            <tr>
              <th>Cliente</th>
              <th>Monto</th>
              <th>Método</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pagos.length === 0">
              <td colspan="4" class="py-10 text-center text-gray-500 italic">
                Sin resultados.
              </td>
            </tr>
            <tr v-for="pago in pagosPaginados" :key="pago.id" class="table-row">
              <td class="font-medium text-gray-900">
                {{ pago.paymentable?.member?.name || "—" }}
              </td>
              <td class="text-emerald-600 font-semibold">
                {{ formatCurrency(pago.amount) }}
              </td>
              <td>
                <BaseBadge color="gray">{{ pago.payment_method?.name }}</BaseBadge>
              </td>
              <td class="text-gray-500 text-xs">{{ formatDate(pago.paid_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="totalPagesPagos > 1"
        class="flex items-center justify-between text-sm text-gray-600"
      >
        <span>Página {{ currentPagePagos }} de {{ totalPagesPagos }}</span>
        <div class="flex gap-1">
          <BaseButton
            variant="secondary"
            size="sm"
            :disabled="currentPagePagos === 1"
            @click="currentPagePagos--"
          >
            Anterior
          </BaseButton>
          <BaseButton
            variant="secondary"
            size="sm"
            :disabled="currentPagePagos === totalPagesPagos"
            @click="currentPagePagos++"
          >
            Siguiente
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <BaseModal v-model="openModal" title="Registrar Pago" size="sm" @close="limpiarFormulario">
      <form id="payment-form" class="space-y-4" @submit.prevent="registrarPago">
        <div class="relative">
          <BaseInput
            v-model="busqueda"
            label="Cliente"
            placeholder="Buscar nombre..."
            autocomplete="off"
          />
          <ul
            v-if="miembrosFiltrados.length > 0"
            class="border border-gray-200 rounded-lg bg-white mt-1 max-h-32 overflow-y-auto shadow-lg absolute left-0 right-0 z-10 text-xs"
          >
            <li
              v-for="miembro in miembrosFiltrados"
              :key="miembro.id"
              class="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-0"
              @click="seleccionarMiembro(miembro)"
            >
              {{ miembro.name }}
            </li>
          </ul>
        </div>

        <BaseInput
          v-model="nuevoPago.amount"
          label="Monto"
          type="number"
          min="0"
          step="0.01"
          placeholder="0"
          required
        />

        <BaseSelect
          v-model="nuevoPago.payment_method_id"
          label="Método"
          placeholder="Seleccionar..."
          :options="metodosPago.map((m) => ({ value: m.id, label: m.name }))"
          required
        />
      </form>

      <template #footer>
        <BaseButton variant="secondary" :disabled="ProcesandoPago" @click="cerrarModal">
          Cancelar
        </BaseButton>
        <BaseButton
          variant="primary"
          type="submit"
          form="payment-form"
          :loading="ProcesandoPago"
        >
          Guardar
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/axios";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { BaseButton, BaseInput, BaseSelect, BaseCard, BaseBadge, BaseModal } from "@/components/ui";
import { SWAL_COLORS } from "@/lib/colors";
// --- ESTADO ---
const pagos = ref([]);
const currentPagePagos = ref(1);
const PER_PAGE = 10;
const totalPagesPagos = computed(() => Math.ceil(pagos.value.length / PER_PAGE));
const pagosPaginados = computed(() => {
  const start = (currentPagePagos.value - 1) * PER_PAGE;
  return pagos.value.slice(start, start + PER_PAGE);
});
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
    currentPagePagos.value = 1;
  } catch (error) {
    console.error(error);

    // Manejo de errores de red
    if (!error.response) {
      if (!navigator.onLine) {
        Swal.fire({
          icon: "error",
          title: "Sin conexión a internet",
          text: "No se pudo cargar el historial. Verifica tu conexión.",
          confirmButtonColor: SWAL_COLORS.danger,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error de conexión",
          text: "No se pudo conectar con el servidor para cargar el historial.",
          confirmButtonColor: SWAL_COLORS.danger,
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
        confirmButtonColor: SWAL_COLORS.info,
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
          confirmButtonColor: SWAL_COLORS.info,
        });
      } else if (!navigator.onLine) {
        Swal.fire({
          icon: "error",
          title: "Sin conexión a internet",
          html: `<p>No se pudo procesar el pago porque no hay conexión a internet.</p>
                 <p class="text-sm mt-2">Por favor, verifica tu conexión y vuelve a intentar.</p>`,
          confirmButtonColor: SWAL_COLORS.danger,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error de conexión",
          html: `<p>No se pudo conectar con el servidor para procesar el pago.</p>
                 <p class="text-sm mt-2">Verifica tu conexión e intenta nuevamente.</p>`,
          confirmButtonColor: SWAL_COLORS.danger,
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
          confirmButtonColor: SWAL_COLORS.danger,
        });
      } else if (status === 422) {
        Swal.fire({
          icon: "warning",
          title: "Datos inválidos",
          text: error.response.data?.message || "Los datos del pago no son válidos.",
          confirmButtonColor: SWAL_COLORS.warning,
        });
      } else if (status >= 500) {
        Swal.fire({
          icon: "error",
          title: "Error del servidor",
          html: `<p>Ocurrió un error en el servidor al procesar el pago.</p>
                 <p class="text-sm mt-2"><strong>IMPORTANTE:</strong> Verifica si el pago se registró antes de intentar nuevamente.</p>`,
          confirmButtonColor: SWAL_COLORS.danger,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error al registrar pago",
          text: error.response?.data?.message || "No se pudo registrar el pago.",
          confirmButtonColor: SWAL_COLORS.danger,
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
