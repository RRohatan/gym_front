<template>
  <div
    class="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-black"
  >
    <div class="bg-white rounded-2xl shadow-xl p-4 sm:p-8 space-y-6">
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 gap-4"
      >
        <h2 class="text-2xl font-bold text-gray-800">📦 Caja Diaria</h2>

        <div class="flex flex-wrap gap-2 w-full md:w-auto">
          <router-link to="/Menu" class="btn btn-dark flex-1 md:flex-none justify-center">
            🏠 <span class="hidden sm:inline">Inicio</span>
          </router-link>
          <button
            @click="abrirModalGasto"
            class="btn btn-danger-solid flex-1 md:flex-none justify-center text-sm"
          >
            💸 Gasto
          </button>
          <button
            @click="confirmarCierre"
            class="btn btn-dark flex-1 md:flex-none justify-center text-sm"
          >
            🔒 Cerrar
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-10">Cargando...</div>

      <div v-else>
        <div v-if="todayCashbox" class="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
          <h3 class="text-sm font-bold mb-3 text-blue-900 uppercase tracking-wide">
            Resumen Hoy ({{ todayCashbox.date }})
          </h3>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div class="bg-white p-3 rounded-lg shadow-sm">
              <p class="text-gray-500 text-xs">🔓 Apertura</p>
              <p class="text-lg font-bold text-gray-800">
                {{ formatCurrency(todayCashbox.opening_balance) }}
              </p>
            </div>
            <div class="bg-white p-3 rounded-lg shadow-sm">
              <p class="text-green-600 text-xs">💰 Ingresos</p>
              <p class="text-lg font-bold text-green-700">
                {{ formatCurrency(todayCashbox.total_income) }}
              </p>
            </div>
            <div class="bg-white p-3 rounded-lg shadow-sm">
              <p class="text-red-600 text-xs">💸 Gastos</p>
              <p class="text-lg font-bold text-red-700">
                {{ formatCurrency(todayCashbox.total_expense) }}
              </p>
            </div>
            <div class="bg-blue-600 p-3 rounded-lg shadow text-white">
              <p class="text-blue-100 text-xs">🧮 Cierre</p>
              <p class="text-lg font-bold">{{ formatCurrency(todayCashbox.closing_balance) }}</p>
            </div>
          </div>
        </div>

        <div v-else class="bg-yellow-50 p-6 rounded-xl border border-yellow-200 text-center">
          <p class="text-yellow-800 font-bold mb-4">⚠️ Caja cerrada</p>
          <form @submit.prevent="abrirCaja" class="flex gap-2 max-w-sm mx-auto">
            <input
              v-model="nuevoSaldo"
              type="number"
              class="w-full p-2 border rounded-lg"
              placeholder="Saldo inicial..."
              required
            />
            <button type="submit" class="btn btn-primary">Abrir</button>
          </form>
        </div>

        <div class="mt-8">
          <h3 class="font-bold mb-3 text-gray-700">📚 Historial</h3>
          <div class="overflow-x-auto rounded-lg border border-gray-100 shadow-sm">
            <table class="w-full text-sm min-w-[600px]">
              <thead class="bg-gray-100 text-gray-700 uppercase text-xs">
                <tr>
                  <th class="p-3 text-left">Fecha</th>
                  <th class="p-3 text-right">Apertura</th>
                  <th class="p-3 text-right">Ingresos</th>
                  <th class="p-3 text-right">Gastos</th>
                  <th class="p-3 text-right">Cierre</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr v-for="cb in cashboxes" :key="cb.id">
                  <td class="p-3 font-medium">{{ cb.date }}</td>
                  <td class="p-3 text-right">{{ formatCurrency(cb.opening_balance) }}</td>
                  <td class="p-3 text-right text-green-600">
                    {{ formatCurrency(cb.total_income) }}
                  </td>
                  <td class="p-3 text-right text-red-600">
                    {{ formatCurrency(cb.total_expense) }}
                  </td>
                  <td class="p-3 text-right font-bold">{{ formatCurrency(cb.closing_balance) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div
        v-if="showExpenseModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white w-full max-w-sm p-6 rounded-xl shadow-2xl">
          <h2 class="text-lg font-bold mb-4">💸 Registrar Gasto</h2>
          <form @submit.prevent="guardarGasto" class="space-y-4">
            <input
              v-model="expenseForm.concepto"
              type="text"
              placeholder="Concepto (ej: Luz)"
              class="w-full border p-2 rounded-lg"
              required
            />
            <input
              v-model.number="expenseForm.monto"
              type="number"
              placeholder="Monto"
              class="w-full border p-2 rounded-lg"
              required
            />
            <input
              v-model="expenseForm.fecha"
              type="date"
              class="w-full border p-2 rounded-lg"
              required
            />

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="showExpenseModal = false"
                class="btn btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button type="submit" class="btn btn-danger-solid flex-1">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// (El script sigue siendo EXACTAMENTE el mismo que te di antes, no hace falta cambiarlo)
// Solo asegúrate de copiar y pegar el script de la respuesta anterior si lo borraste.
import { ref, onMounted, reactive } from "vue";
import api from "@/axios";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";
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
  } catch (err) {
    if (err.response?.status === 422)
      Swal.fire("Aviso", "Ya existe caja hoy", "warning").then(() => fetchCashboxes());
    else Swal.fire("Error", "No se pudo abrir", "error");
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
    if (todayCashbox.value) {
      todayCashbox.value.total_expense += expenseForm.monto;
      todayCashbox.value.closing_balance -= expenseForm.monto;
    }
    showExpenseModal.value = false;
    Swal.fire("Listo", "Gasto visual registrado", "success");
  } catch (e) {
    Swal.fire("Error", "Fallo", "error");
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
