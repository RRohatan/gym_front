<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
    <div class="max-w-5xl mx-auto">

     <h1 class="text-4xl font-extrabold text-center mb-2">
  🏋️‍♂️ {{ user?.gimnasio?.nombre || 'Gimnasio no encontrado' }}
    </h1>

     <p class="text-lg text-center text-gray-300 mb-10">Bienvenido {{ user?.name || 'Usuario no encontrado' }}</p>

    <!-- ===== SECCIÓN DE ESTADÍSTICAS (NUEVO) ===== -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

      <!-- Card Activos -->
      <div class="stat-card bg-green-600">
        <h3 class="text-sm font-semibold uppercase opacity-80">Activos</h3>
        <p v-if="loadingStats" class="stat-loading"></p>
        <p v-else class="text-4xl font-bold">{{ stats.active }}</p>
      </div>

      <!-- Card Vencidos -->
      <div class="stat-card bg-red-600">
        <h3 class="text-sm font-semibold uppercase opacity-80">Vencidos</h3>
        <p v-if="loadingStats" class="stat-loading"></p>
        <p v-else class="text-4xl font-bold">{{ stats.expired }}</p>
      </div>

      <!-- Card Inactivos (Por Pagar) -->
      <div class="stat-card bg-yellow-500">
        <h3 class="text-sm font-semibold uppercase opacity-80">Inactivos (Por Pagar)</h3>
        <p v-if="loadingStats" class="stat-loading"></p>
        <p v-else class="text-4xl font-bold">{{ stats.inactive_unpaid }}</p>
      </div>

      <!-- --- ¡CAMBIO AQUÍ! --- -->
      <!-- Card Vencen Pronto (AHORA ES UN LINK) -->
      <router-link
        to="/Membership?filter=expiring_soon"
        class="stat-card bg-blue-500 hover:bg-blue-600 transition-colors duration-200"
      >
        <h3 class="text-sm font-semibold uppercase opacity-80">Vencen Pronto (3 Días)</h3>
        <p v-if="loadingStats" class="stat-loading"></p>
        <p v-else class="text-4xl font-bold">{{ stats.expiring_soon }}</p>
      </router-link>
      <!-- --- FIN DEL CAMBIO --- -->

    </div>
    <!-- ===== FIN DE ESTADÍSTICAS ===== -->


    <!--<pre class="text-white">{{ JSON.stringify(user, null, 2) }}</pre>-->

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Card -->
        <router-link to="/members" class="menu-card bg-blue-600 hover:bg-blue-700">
          <div class="text-5xl">👥</div>
          <h2 class="text-xl font-bold"> Ver Clientes</h2>
        </router-link>

        <router-link to="/Payments" class="menu-card bg-green-600 hover:bg-green-700">
          <div class="text-5xl">💰</div>
          <h2 class="text-xl font-bold">Pagos</h2>
        </router-link>

        <router-link to="/Products" class="menu-card bg-purple-600 hover:bg-purple-700">
          <div class="text-5xl">📦</div>
          <h2 class="text-xl font-bold">Productos</h2>
        </router-link>

        <router-link to="/membershipPlans" class="menu-card bg-yellow-600 hover:bg-yellow-700">
          <div class="text-5xl">📅</div>
          <h2 class="text-xl font-bold">Planes</h2>
        </router-link>

        <router-link to="/Membership" class="menu-card bg-pink-600 hover:bg-pink-700">
          <div class="text-5xl">📊</div>
          <h2 class="text-xl font-bold">Membresias</h2>
        </router-link>


        <router-link to="/CashBox" class="menu-card bg-orange-600 hover:bg-orange-700">
          <div class="text-5xl">💼</div>
          <h2 class="text-xl font-bold">Caja</h2>
        </router-link>

        <button @click="logout" class="menu-card bg-red-600 hover:bg-red-700">
          <div class="text-5xl">🔒</div>
          <h2 class="text-xl font-bold">Cerrar sesión</h2>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue' // Importar ref y onMounted
import { useAuthStore } from '@/stores/useAuthStore'
import { useRouter } from 'vue-router'
import api from '@/axios' // Importar api

const auth = useAuthStore()
const router = useRouter()

const user = auth.user
const stats = ref({}) // Ref para guardar las estadísticas
const loadingStats = ref(true) // Ref para el estado de carga

console.log('Usuario:', user)

// --- NUEVA FUNCIÓN ---
// Cargar las estadísticas al montar el componente
onMounted(async () => {
  try {
    const { data } = await api.get('/memberships/stats')
    stats.value = data
  } catch (error) {
    console.error('Error al cargar estadísticas:', error)
    stats.value = { active: 0, expired: 0, inactive_unpaid: 0, expiring_soon: 0 } // Valores por defecto en caso de error
  } finally {
    loadingStats.value = false
  }
})

const logout = () => {
  auth.logout()
  router.push('/')
}
</script>

<style scoped>
.menu-card {
  @apply rounded-2xl shadow-xl p-6 text-center transition duration-200 flex flex-col items-center justify-center space-y-3 cursor-pointer;
}

/* --- NUEVOS ESTILOS --- */
.stat-card {
  @apply rounded-2xl shadow-lg p-5 text-left;
}

.stat-loading {
  @apply w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin;
}
</style>
