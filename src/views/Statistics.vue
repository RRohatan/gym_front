<template>
  <div
    class="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
  >
    <div class="">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 class="text-2xl sm:text-3xl font-bold ml-12 sm:ml-0 flex items-center gap-2">
          📈 Estadísticas y Reportes
        </h1>
        <router-link to="/Menu" class="btn btn-dark"> 🏠 Volver al Inicio </router-link>
      </div>

      <div v-if="loading" class="text-center py-20">
        <p class="text-xl text-gray-400 animate-pulse">Cargando análisis de datos...</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div class="bg-white rounded-2xl shadow-xl p-4 sm:p-6 flex flex-col text-gray-800">
          <h3 class="font-bold text-lg mb-4 flex items-center gap-2 border-b pb-2">
            📊 Ingresos (Últimos 7 días)
          </h3>
          <div class="flex-1 relative min-h-[300px]">
            <Bar v-if="incomeData" :data="incomeData" :options="barOptions" />
            <p v-else class="text-gray-500 text-center mt-10">No hay datos recientes.</p>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-xl p-4 sm:p-6 flex flex-col text-gray-800">
          <h3 class="font-bold text-lg mb-4 flex items-center gap-2 border-b pb-2">
            🍰 Distribución de Clientes
          </h3>
          <div class="flex-1 relative min-h-[300px] flex justify-center">
            <Doughnut v-if="pieData" :data="pieData" :options="pieOptions" />
            <p v-else class="text-gray-500 text-center mt-10">No hay datos de membresías.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/axios";
import dayjs from "dayjs";

// --- CHART.JS IMPORTS ---
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "vue-chartjs";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const loading = ref(true);
const incomeData = ref(null);
const pieData = ref(null);

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};
const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
};

onMounted(async () => {
  try {
    // 1. Cargar Estadísticas de Membresías (Para la Dona)
    const { data: statsData } = await api.get("/memberships/stats");

    pieData.value = {
      labels: ["Activos", "Vencidos", "Por Pagar"],
      datasets: [
        {
          backgroundColor: ["#16A34A", "#DC2626", "#EAB308"],
          data: [statsData.active, statsData.expired, statsData.inactive_unpaid],
        },
      ],
    };

    // 2. Cargar Historial de Pagos (Para las Barras)
    const end = dayjs().format("YYYY-MM-DD");
    const start = dayjs().subtract(6, "days").format("YYYY-MM-DD");
    const { data: historyData } = await api.get(
      `/payments/history?start_date=${start}&end_date=${end}`,
    );

    procesarDatosIngresos(historyData.historial, start);
  } catch (error) {
    console.error("Error cargando estadísticas:", error);
  } finally {
    loading.value = false;
  }
});

const procesarDatosIngresos = (historial, startDate) => {
  const ingresosPorFecha = {};

  historial.forEach((p) => {
    const fechaLocal = dayjs(p.paid_at).format("YYYY-MM-DD");
    if (!ingresosPorFecha[fechaLocal]) ingresosPorFecha[fechaLocal] = 0;
    ingresosPorFecha[fechaLocal] += Number(p.amount);
  });

  const dias = [];
  const montos = [];

  for (let i = 0; i < 7; i++) {
    const fechaObj = dayjs(startDate).add(i, "day");
    const fechaKey = fechaObj.format("YYYY-MM-DD");
    const label = fechaObj
      .toDate()
      .toLocaleDateString("es-CO", { weekday: "short", day: "numeric" });

    dias.push(label);
    montos.push(ingresosPorFecha[fechaKey] || 0);
  }

  incomeData.value = {
    labels: dias,
    datasets: [
      { label: "Ingresos ($)", backgroundColor: "#2563EB", borderRadius: 5, data: montos },
    ],
  };
};
</script>
