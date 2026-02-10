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

        <div class="bg-white rounded-2xl shadow-xl p-4 sm:p-6 flex flex-col text-gray-800">
          <h3 class="font-bold text-lg mb-4 flex items-center gap-2 border-b pb-2">
            🥤 Ventas Productos (Últimos 7 días)
          </h3>
          <div class="flex-1 relative min-h-[300px]">
            <Bar v-if="productSalesData" :data="productSalesData" :options="barOptions" />
            <p v-else class="text-gray-500 text-center mt-10">No hay ventas recientes.</p>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-xl p-4 sm:p-6 flex flex-col text-gray-800">
          <h3 class="font-bold text-lg mb-4 flex items-center gap-2 border-b pb-2">
            🏆 Top Productos Más Vendidos
          </h3>
          <div class="flex-1 relative min-h-[300px]">
            <Bar
              v-if="topProductsData"
              :data="topProductsData"
              :options="{ ...barOptions, indexAxis: 'y' }"
            />
            <p v-else class="text-gray-500 text-center mt-10">No hay datos de productos.</p>
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
import Swal from "sweetalert2";

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
const productSalesData = ref(null);
const topProductsData = ref(null);

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

    procesarDatosIngresos(historyData.historial, start);
  } catch (error) {
    console.error("Error cargando estadísticas principales:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudieron cargar las estadísticas de ingresos/membresías.",
    });
  }

  // 3. Cargar Ventas de Productos (Independiente)
  try {
    const end = dayjs().format("YYYY-MM-DD");
    const start = dayjs().subtract(6, "days").format("YYYY-MM-DD");
    const { data: salesResponse } = await api.get("/supplementSale");
    procesarVentasProductos(salesResponse.data, start);
  } catch (error) {
    console.error("Error cargando ventas de productos:", error);
    // No bloqueamos la UI, solo mostramos error en consola o un toast sutil
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "warning",
      title: "No se pudieron cargar las ventas de productos",
      showConfirmButton: false,
      timer: 3000,
    });
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

const procesarVentasProductos = (sales, startDate) => {
  // 1. Gráfica de Ventas Diarias (Últimos 7 días)
  const ventasPorFecha = {};
  // 2. Top Productos (Global o en rango, usaremos Global para este ejemplo o rango si prefieres)
  const productosVendidos = {};

  const startObj = dayjs(startDate);

  sales.forEach((sale) => {
    const saleDate = dayjs(sale.created_at);

    // Solo contar si está en el rango de los últimos 7 días para la gráfica de tiempo
    if (saleDate.isAfter(startObj.subtract(1, "day"))) {
      // Restamos 1 para asegurar incluir el día inicial
      const fechaLocal = saleDate.format("YYYY-MM-DD");
      if (!ventasPorFecha[fechaLocal]) ventasPorFecha[fechaLocal] = 0;
      ventasPorFecha[fechaLocal] += Number(sale.total);
    }

    // Contar productos para el Top (podemos hacerlo histórico o semanal, haré histórico para mas data)
    const productName = sale.product?.name || "Desconocido";
    if (!productosVendidos[productName]) productosVendidos[productName] = 0;
    productosVendidos[productName] += Number(sale.quantity);
  });

  // --- PREPARAR DATOS VENTAS DIARIAS ---
  const dias = [];
  const montos = [];

  for (let i = 0; i < 7; i++) {
    const fechaObj = dayjs(startDate).add(i, "day");
    const fechaKey = fechaObj.format("YYYY-MM-DD");
    const label = fechaObj
      .toDate()
      .toLocaleDateString("es-CO", { weekday: "short", day: "numeric" });

    dias.push(label);
    montos.push(ventasPorFecha[fechaKey] || 0);
  }

  productSalesData.value = {
    labels: dias,
    datasets: [
      { label: "Ventas Productos ($)", backgroundColor: "#10B981", borderRadius: 5, data: montos },
    ],
  };

  // --- PREPARAR DATOS TOP PRODUCTOS ---
  // Ordenar y tomar los top 5
  const topOrdenados = Object.entries(productosVendidos)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  topProductsData.value = {
    labels: topOrdenados.map(([name]) => name),
    datasets: [
      {
        label: "Unidades Vendidas",
        backgroundColor: ["#F59E0B", "#EF4444", "#3B82F6", "#10B981", "#8B5CF6"],
        data: topOrdenados.map(([, cant]) => cant),
      },
    ],
  };
};
</script>
