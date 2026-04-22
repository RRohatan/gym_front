<template>
  <div class="page-layout">
    <BaseCard title="Caja Diaria" subtitle="Control de apertura y cierre" class="space-y-6">
      <template #actions>
        <router-link to="/Menu" class="btn btn-secondary flex-1 sm:flex-none">
          Inicio
        </router-link>
        <BaseButton variant="danger-solid" class="flex-1 sm:flex-none" @click="abrirModalGasto">
          Registrar gasto
        </BaseButton>
        <BaseButton variant="dark" class="flex-1 sm:flex-none" @click="confirmarCierre">
          Cerrar caja
        </BaseButton>
      </template>

      <div v-if="loading" class="text-center py-10 text-gray-500">Cargando...</div>

      <div v-else class="space-y-6">
        <div
          v-if="todayCashbox"
          class="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm"
        >
          <h3 class="text-sm font-semibold mb-3 text-blue-900 uppercase tracking-wide">
            Resumen Hoy ({{ todayCashbox.date }})
          </h3>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div class="bg-white p-3 rounded-lg shadow-sm">
              <p class="text-gray-500 text-xs">🔓 Apertura</p>
              <p class="text-lg font-semibold text-gray-800">
                {{ formatCurrency(todayCashbox.opening_balance) }}
              </p>
            </div>
            <div class="bg-white p-3 rounded-lg shadow-sm">
              <p class="text-emerald-600 text-xs">💰 Ingresos</p>
              <p class="text-lg font-semibold text-emerald-700">
                {{ formatCurrency(todayCashbox.total_income) }}
              </p>
            </div>
            <div class="bg-white p-3 rounded-lg shadow-sm">
              <p class="text-red-600 text-xs">💸 Gastos</p>
              <p class="text-lg font-semibold text-red-700">
                {{ formatCurrency(todayCashbox.total_expense) }}
              </p>
            </div>
            <div class="bg-blue-600 p-3 rounded-lg shadow text-white">
              <p class="text-blue-100 text-xs">🧮 Cierre</p>
              <p class="text-lg font-semibold">
                {{ formatCurrency(todayCashbox.closing_balance) }}
              </p>
            </div>
          </div>
        </div>

        <div
          v-else
          class="bg-yellow-50 p-6 rounded-xl border border-yellow-200 text-center"
        >
          <p class="text-yellow-800 font-semibold mb-4">⚠️ Caja cerrada</p>
          <form
            class="flex gap-2 max-w-sm mx-auto items-end"
            @submit.prevent="abrirCaja"
          >
            <BaseInput
              v-model="nuevoSaldo"
              type="number"
              placeholder="Saldo inicial..."
              required
              class="flex-1"
            />
            <BaseButton variant="primary" type="submit">Abrir</BaseButton>
          </form>
        </div>

        <div>
          <h3 class="font-semibold mb-3 text-gray-700">📚 Historial</h3>
          <div class="table-wrap">
            <table class="w-full text-sm min-w-[600px]">
              <thead class="table-head">
                <tr>
                  <th>Fecha</th>
                  <th class="!text-right">Apertura</th>
                  <th class="!text-right">Ingresos</th>
                  <th class="!text-right">Gastos</th>
                  <th class="!text-right">Cierre</th>
                </tr>
              </thead>
              <tbody class="bg-white">
                <tr v-for="cb in cashboxes" :key="cb.id" class="table-row">
                  <td class="font-medium">{{ cb.date }}</td>
                  <td class="text-right">{{ formatCurrency(cb.opening_balance) }}</td>
                  <td class="text-right text-emerald-600">
                    {{ formatCurrency(cb.total_income) }}
                  </td>
                  <td class="text-right text-red-600">
                    {{ formatCurrency(cb.total_expense) }}
                  </td>
                  <td class="text-right font-semibold">
                    {{ formatCurrency(cb.closing_balance) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BaseCard>

    <BaseModal v-model="showExpenseModal" title="💸 Registrar Gasto" size="sm">
      <form id="expense-form" class="space-y-4" @submit.prevent="guardarGasto">
        <BaseInput
          v-model="expenseForm.concepto"
          label="Concepto"
          placeholder="Ej: Luz"
          required
        />
        <BaseInput
          v-model.number="expenseForm.monto"
          type="number"
          label="Monto"
          placeholder="0"
          required
        />
        <BaseInput
          v-model="expenseForm.fecha"
          type="date"
          label="Fecha"
          required
        />
      </form>

      <template #footer>
        <BaseButton variant="secondary" @click="showExpenseModal = false">
          Cancelar
        </BaseButton>
        <BaseButton variant="danger-solid" type="submit" form="expense-form">
          Guardar
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import api from "@/axios";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";
import { BaseButton, BaseInput, BaseCard, BaseModal } from "@/components/ui";
import { SWAL_COLORS } from "@/lib/colors";
const router = useRouter();
const cashboxes = ref([]);
const todayCashbox = ref(null);
const loading = ref(true);
const nuevoSaldo = ref("");
const showExpenseModal = ref(false);
const expenseForm = reactive({ concepto: "", monto: "", fecha: dayjs().format("YYYY-MM-DD") });
const fetchCashboxes = async () => {
  try {
    const { data } = await api.get("/dailyCashbox");
    cashboxes.value = data;
    const hoy = dayjs().format("YYYY-MM-DD");
    todayCashbox.value = cashboxes.value.find((cb) => cb.date.substring(0, 10) === hoy);
  } catch (error) {
    console.error(error);

    // Manejo de errores de red
    if (!error.response) {
      if (!navigator.onLine) {
        Swal.fire({
          icon: "error",
          title: "Sin conexión a internet",
          text: "No se pudo cargar la información de caja. Verifica tu conexión.",
          confirmButtonColor: SWAL_COLORS.danger,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error de conexión",
          text: "No se pudo conectar con el servidor para cargar la caja.",
          confirmButtonColor: SWAL_COLORS.danger,
        });
      }
    }
  } finally {
    loading.value = false;
  }
};
const abrirCaja = async () => {
  try {
    const { data } = await api.post("/dailyCashbox", {
      date: dayjs().format("YYYY-MM-DD"),
      opening_balance: parseFloat(nuevoSaldo.value),
    });
    cashboxes.value.unshift(data);
    todayCashbox.value = data;
    nuevoSaldo.value = "";
    Swal.fire("Éxito", "Caja abierta", "success");
  } catch (error) {
    // Manejo de errores de red
    if (!error.response) {
      if (!navigator.onLine) {
        Swal.fire({
          icon: "error",
          title: "Sin conexión a internet",
          text: "No se pudo abrir la caja. Verifica tu conexión e intenta nuevamente.",
          confirmButtonColor: SWAL_COLORS.danger,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error de conexión",
          text: "No se pudo conectar con el servidor para abrir la caja.",
          confirmButtonColor: SWAL_COLORS.danger,
        });
      }
    } else if (error.response.status === 422) {
      Swal.fire("Aviso", "Ya existe caja hoy", "warning").then(() => fetchCashboxes());
    } else if (error.response.status >= 500) {
      Swal.fire({
        icon: "error",
        title: "Error del servidor",
        text: "Ocurrió un error en el servidor. Intenta nuevamente más tarde.",
        confirmButtonColor: SWAL_COLORS.danger,
      });
    } else {
      Swal.fire("Error", "No se pudo abrir la caja", "error");
    }
  }
};
const abrirModalGasto = () => {
  expenseForm.concepto = "";
  expenseForm.monto = "";
  expenseForm.fecha = dayjs().format("YYYY-MM-DD");
  showExpenseModal.value = true;
};
const guardarGasto = async () => {
  try {
    await api.post("/gastos", {
      concepto: expenseForm.concepto,
      monto: expenseForm.monto,
      fecha: expenseForm.fecha,
    });
    showExpenseModal.value = false;
    await fetchCashboxes();
    Swal.fire("Listo", "Gasto registrado correctamente", "success");
  } catch (error) {
    if (!error.response) {
      if (!navigator.onLine) {
        Swal.fire({
          icon: "error",
          title: "Sin conexión a internet",
          text: "No se pudo registrar el gasto. Verifica tu conexión.",
          confirmButtonColor: SWAL_COLORS.danger,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error de conexión",
          text: "No se pudo conectar con el servidor para registrar el gasto.",
          confirmButtonColor: SWAL_COLORS.danger,
        });
      }
    } else {
      Swal.fire("Error", "No se pudo registrar el gasto", "error");
    }
  }
};
const confirmarCierre = () => {
  if (!todayCashbox.value) return;
  const { opening_balance, total_income, total_expense, closing_balance } = todayCashbox.value;
  Swal.fire({
    title: "Arqueo",
    html: `<div class='text-left text-sm font-mono'>Inicial: ${formatCurrency(opening_balance)}<br>+Ingresos: ${formatCurrency(total_income)}<br>-Gastos: ${formatCurrency(total_expense)}<hr><b>=Total: ${formatCurrency(closing_balance)}</b></div>`,
    showCancelButton: true,
    confirmButtonText: "Cerrar Turno",
  }).then((r) => {
    if (r.isConfirmed) router.push("/Menu");
  });
};
const formatCurrency = (val) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(val);
onMounted(() => fetchCashboxes());
</script>
