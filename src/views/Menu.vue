<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-8">
    <div class="max-w-6xl mx-auto">

      <h1 class="text-3xl sm:text-4xl font-extrabold text-center mb-2 animate-fade-in">
        🏋️‍♂️ {{ user?.gimnasio?.nombre || 'Gimnasio' }}
      </h1>
      <p class="text-lg text-center text-gray-300 mb-8">
        Bienvenido, {{ user?.name }}
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        <div class="stat-card bg-green-600">
          <h3 class="text-xs font-bold uppercase opacity-90 tracking-wider">Activos</h3>
          <p v-if="loadingStats" class="stat-loading"></p>
          <p v-else class="text-3xl font-bold mt-1">{{ stats.active }}</p>
        </div>

        <router-link to="/Membership?filter=expired" class="stat-card bg-red-600 hover:bg-red-700 cursor-pointer">
          <h3 class="text-xs font-bold uppercase opacity-90 tracking-wider">Vencidos</h3>
          <p v-if="loadingStats" class="stat-loading"></p>
          <p v-else class="text-3xl font-bold mt-1">{{ stats.expired }}</p>
        </router-link>

        <router-link to="/Membership?filter=inactive_unpaid" class="stat-card bg-yellow-500 hover:bg-yellow-600 cursor-pointer text-white">
          <h3 class="text-xs font-bold uppercase opacity-90 tracking-wider">Por Pagar</h3>
          <p v-if="loadingStats" class="stat-loading"></p>
          <p v-else class="text-3xl font-bold mt-1">{{ stats.inactive_unpaid }}</p>
        </router-link>

        <router-link to="/Membership?filter=expiring_soon" class="stat-card bg-blue-500 hover:bg-blue-600 cursor-pointer">
          <h3 class="text-xs font-bold uppercase opacity-90 tracking-wider">Vencen Pronto (3 días)</h3>
          <p v-if="loadingStats" class="stat-loading"></p>
          <p v-else class="text-3xl font-bold mt-1">{{ stats.expiring_soon }}</p>
        </router-link>
      </div>

      <div v-if="!loadingStats" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

        <div class="bg-white rounded-2xl shadow-xl p-4 sm:p-6 flex flex-col">
          <h3 class="text-gray-800 font-bold text-lg mb-4 flex items-center gap-2">
            📊 Ingresos (Últimos 7 días)
          </h3>
          <div class="flex-1 relative min-h-[250px]">
             <Bar v-if="incomeData" :data="incomeData" :options="barOptions" />
             <p v-else class="text-gray-500 text-center mt-10">No hay datos de ingresos recientes.</p>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-xl p-4 sm:p-6 flex flex-col">
          <h3 class="text-gray-800 font-bold text-lg mb-4 flex items-center gap-2">
            🍰 Distribución de Clientes
          </h3>
          <div class="flex-1 relative min-h-[250px] flex justify-center">
            <Doughnut v-if="pieData" :data="pieData" :options="pieOptions" />
            <p v-else class="text-gray-500 text-center mt-10">No hay datos de membresías.</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <router-link to="/members" class="menu-card bg-blue-600 hover:bg-blue-700">
          <div class="text-4xl sm:text-5xl">👥</div>
          <h2 class="text-base sm:text-xl font-bold mt-2">Clientes</h2>
        </router-link>

        <router-link to="/Payments" class="menu-card bg-green-600 hover:bg-green-700">
          <div class="text-4xl sm:text-5xl">💰</div>
          <h2 class="text-base sm:text-xl font-bold mt-2">Pagos</h2>
        </router-link>

        <router-link to="/Products" class="menu-card bg-purple-600 hover:bg-purple-700">
          <div class="text-4xl sm:text-5xl">📦</div>
          <h2 class="text-base sm:text-xl font-bold mt-2">Productos</h2>
        </router-link>

        <router-link to="/membershipPlans" class="menu-card bg-yellow-600 hover:bg-yellow-700">
          <div class="text-4xl sm:text-5xl">📅</div>
          <h2 class="text-base sm:text-xl font-bold mt-2">Planes</h2>
        </router-link>

        <router-link to="/Membership" class="menu-card bg-pink-600 hover:bg-pink-700">
          <div class="text-4xl sm:text-5xl">📊</div>
          <h2 class="text-base sm:text-xl font-bold mt-2">Membresías</h2>
        </router-link>

        <router-link to="/CashBox" class="menu-card bg-orange-600 hover:bg-orange-700">
          <div class="text-4xl sm:text-5xl">💼</div>
          <h2 class="text-base sm:text-xl font-bold mt-2">Caja</h2>
        </router-link>

        <button @click="logout" class="menu-card bg-red-600 hover:bg-red-700 col-span-2 md:col-span-1">
          <div class="text-4xl sm:text-5xl">🔒</div>
          <h2 class="text-base sm:text-xl font-bold mt-2">Salir</h2>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { useRouter } from 'vue-router'
import api from '@/axios'
import dayjs from 'dayjs'

// --- CHART.JS IMPORTS ---
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from 'chart.js'
import { Bar, Doughnut } from 'vue-chartjs'

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const auth = useAuthStore()
const router = useRouter()
const user = auth.user

// Estado
const stats = ref({ active: 0, expired: 0, inactive_unpaid: 0, expiring_soon: 0 })
const loadingStats = ref(true)

// Datos para gráficos
const incomeData = ref(null)
const pieData = ref(null)

// Configuración visual de gráficos
const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false } // Ocultar leyenda en barras
  }
}
const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
}

onMounted(async () => {
  try {
    // 1. Cargar Estadísticas Generales
    const { data: statsData } = await api.get('/memberships/stats')
    stats.value = statsData

    // Configurar Gráfico de Dona (Membresías)
    pieData.value = {
      labels: ['Activos', 'Vencidos', 'Por Pagar'],
      datasets: [
        {
          backgroundColor: ['#16A34A', '#DC2626', '#EAB308'], // Verde, Rojo, Amarillo
          data: [statsData.active, statsData.expired, statsData.inactive_unpaid]
        }
      ]
    }

    // 2. Cargar Historial de Pagos (Últimos 7 días para el gráfico)
    const end = dayjs().format('YYYY-MM-DD')
    const start = dayjs().subtract(6, 'days').format('YYYY-MM-DD')

    // Llamamos al endpoint que ya tienes listo: /payments/history
    const { data: historyData } = await api.get(`/payments/history?start_date=${start}&end_date=${end}`)

    procesarDatosIngresos(historyData.historial, start)

  } catch (error) {
    console.error('Error cargando dashboard:', error)
  } finally {
    loadingStats.value = false
  }
})

// Función para agrupar ingresos por día
// Función para agrupar ingresos por día (CORREGIDA)
const procesarDatosIngresos = (historial, startDate) => {
  // 1. Agrupar montos por fecha LOCAL para asegurar precisión
  const ingresosPorFecha = {}

  historial.forEach(p => {
    // Convertimos la fecha UTC del servidor a la fecha LOCAL del usuario
    const fechaLocal = dayjs(p.paid_at).format('YYYY-MM-DD')

    if (!ingresosPorFecha[fechaLocal]) {
      ingresosPorFecha[fechaLocal] = 0
    }
    ingresosPorFecha[fechaLocal] += Number(p.amount)
  })

  // 2. Construir los datos para el gráfico
  const dias = []
  const montos = []

  for (let i = 0; i < 7; i++) {
    // Objeto dayjs del día iterado
    const fechaObj = dayjs(startDate).add(i, 'day')
    const fechaKey = fechaObj.format('YYYY-MM-DD')

    // --- CORRECCIÓN AQUÍ ---
    // Usamos fechaObj.toDate() para que tome la hora local correcta (00:00 local)
    // en lugar de new Date(string) que interpreta UTC (00:00 UTC -> Ayer 19:00)
    const label = fechaObj.toDate().toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' })

    dias.push(label)
    // Usamos el mapa agrupado en el paso 1
    montos.push(ingresosPorFecha[fechaKey] || 0)
  }

  incomeData.value = {
    labels: dias,
    datasets: [
      {
        label: 'Ingresos ($)',
        backgroundColor: '#2563EB',
        borderRadius: 5,
        data: montos
      }
    ]
  }
}

const logout = () => {
  auth.logout()
  router.push('/')
}
</script>

<style scoped>
/* Transición suave para el título */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

.stat-card {
  @apply rounded-xl shadow-lg p-5 text-left text-white transition-transform duration-200 hover:scale-105;
}

.menu-card {
  @apply rounded-xl shadow-lg p-6 text-center transition-all duration-200 flex flex-col items-center justify-center cursor-pointer text-white hover:shadow-2xl hover:-translate-y-1;
}

.stat-loading {
  @apply w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mt-2;
}
</style>
