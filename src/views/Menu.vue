<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-8">
    <div class="max-w-6xl mx-auto">

      <h1 class="text-3xl sm:text-4xl font-extrabold text-center mb-2 animate-fade-in">
        🏋️‍♂️ {{ user?.gimnasio?.nombre || 'Gimnasio' }}
      </h1>
      <p class="text-lg text-center text-gray-300 mb-8">
        Bienvenido, {{ user?.name }}
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div class="stat-card bg-green-600">
          <h3 class="text-xs font-bold uppercase opacity-90 tracking-wider">Activos</h3>
          <p class="text-3xl font-bold mt-1">{{ stats.active || 0 }}</p>
        </div>

        <router-link to="/Membership?filter=expired" class="stat-card bg-red-600 hover:bg-red-700 cursor-pointer">
          <h3 class="text-xs font-bold uppercase opacity-90 tracking-wider">Vencidos</h3>
          <p class="text-3xl font-bold mt-1">{{ stats.expired || 0 }}</p>
        </router-link>

        <router-link to="/Membership?filter=inactive_unpaid" class="stat-card bg-yellow-500 hover:bg-yellow-600 cursor-pointer text-white">
          <h3 class="text-xs font-bold uppercase opacity-90 tracking-wider">Por Pagar</h3>
          <p class="text-3xl font-bold mt-1">{{ stats.inactive_unpaid || 0 }}</p>
        </router-link>

        <router-link to="/Membership?filter=expiring_soon" class="stat-card bg-blue-500 hover:bg-blue-600 cursor-pointer">
          <h3 class="text-xs font-bold uppercase opacity-90 tracking-wider">Vencen Pronto</h3>
          <p class="text-3xl font-bold mt-1">{{ stats.expiring_soon || 0 }}</p>
        </router-link>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">

        <router-link to="/pos"
          class="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition flex flex-col items-center justify-center gap-4 border border-gray-100 cursor-pointer group col-span-2 md:col-span-1 lg:col-span-1">
          <div class="bg-blue-100 p-4 rounded-full group-hover:bg-blue-200 transition">
            <span class="text-4xl">🛒</span>
          </div>
          <h3 class="text-xl font-bold text-gray-800">Punto de Venta</h3>
        </router-link>

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

        <router-link to="/statistics" class="menu-card bg-teal-600 hover:bg-teal-700">
          <div class="text-4xl sm:text-5xl">📈</div>
          <h2 class="text-base sm:text-xl font-bold mt-2">Estadísticas</h2>
        </router-link>

        <button @click="logout" class="menu-card bg-red-600 hover:bg-red-700">
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

const auth = useAuthStore()
const router = useRouter()
const user = auth.user

// Solo necesitamos stats para las tarjetas de arriba
const stats = ref({})

onMounted(async () => {
  try {
    const { data } = await api.get('/memberships/stats')
    stats.value = data
  } catch (error) {
    console.error('Error cargando stats:', error)
  }
})

const logout = () => {
  auth.logout()
  router.push('/')
}
</script>

<style scoped>
@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in { animation: fadeIn 0.8s ease-out; }

.stat-card {
  @apply rounded-xl shadow-lg p-5 text-left text-white transition-transform duration-200 hover:scale-105;
}

.menu-card {
  @apply rounded-xl shadow-lg p-6 text-center transition-all duration-200 flex flex-col items-center justify-center cursor-pointer text-white hover:shadow-2xl hover:-translate-y-1 active:scale-95 border border-white/10;
}
</style>
