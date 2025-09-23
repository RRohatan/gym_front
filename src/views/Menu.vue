<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
    <div class="max-w-5xl mx-auto">

     <h1 class="text-4xl font-extrabold text-center mb-2">
  🏋️‍♂️ {{ user?.gimnasio?.nombre || 'Gimnasio no encontrado' }}
    </h1>

     <p class="text-lg text-center text-gray-300 mb-10">Bienvenido {{ user?.name || 'Usuario no encontrado' }}</p>

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
import { useAuthStore } from '@/stores/useAuthStore'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const user = auth.user

console.log('Usuario:', user)

const logout = () => {
  auth.logout()
  router.push('/')
}
</script>

<style scoped>
.menu-card {
  @apply rounded-2xl shadow-xl p-6 text-center transition duration-200 flex flex-col items-center justify-center space-y-3 cursor-pointer;
}
</style>
