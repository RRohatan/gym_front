<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-8"
  >
    <div class="">
      <h1 class="text-3xl sm:text-4xl font-extrabold text-center mb-2 animate-fade-in">
        🏋️‍♂️ {{ user?.gimnasio?.nombre || "Gimnasio" }}
      </h1>
      <p class="text-lg text-center text-gray-300 mb-8">Bienvenido, {{ user?.name }}</p>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div class="stat-card bg-green-600">
          <h3 class="text-xs font-bold uppercase opacity-90 tracking-wider">Activos</h3>
          <p class="text-3xl font-bold mt-1">{{ stats.active || 0 }}</p>
        </div>

        <router-link
          to="/Membership?filter=expired"
          class="stat-card bg-red-600 hover:bg-red-700 cursor-pointer"
        >
          <h3 class="text-xs font-bold uppercase opacity-90 tracking-wider">Vencidos</h3>
          <p class="text-3xl font-bold mt-1">{{ stats.expired || 0 }}</p>
        </router-link>

        <router-link
          to="/Membership?filter=inactive_unpaid"
          class="stat-card bg-yellow-500 hover:bg-yellow-600 cursor-pointer text-white"
        >
          <h3 class="text-xs font-bold uppercase opacity-90 tracking-wider">Por Pagar</h3>
          <p class="text-3xl font-bold mt-1">{{ stats.inactive_unpaid || 0 }}</p>
        </router-link>

        <router-link
          to="/Membership?filter=expiring_soon"
          class="stat-card bg-blue-500 hover:bg-blue-600 cursor-pointer"
        >
          <h3 class="text-xs font-bold uppercase opacity-90 tracking-wider">Vencen Pronto</h3>
          <p class="text-3xl font-bold mt-1">{{ stats.expiring_soon || 0 }}</p>
        </router-link>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        <router-link
          to="/pos"
          class="menu-card hover:bg-white/10 col-span-2 md:col-span-1 lg:col-span-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12 sm:h-16 sm:w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 class="text-base sm:text-xl font-bold mt-2">Punto de Venta</h2>
        </router-link>

        <router-link to="/members" class="menu-card hover:bg-white/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12 sm:h-16 sm:w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 class="text-base sm:text-xl font-bold mt-2">Clientes</h2>
        </router-link>

        <router-link to="/Payments" class="menu-card hover:bg-white/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12 sm:h-16 sm:w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 class="text-base sm:text-xl font-bold mt-2">Pagos</h2>
        </router-link>

        <router-link to="/Products" class="menu-card hover:bg-white/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12 sm:h-16 sm:w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h2 class="text-base sm:text-xl font-bold mt-2">Productos</h2>
        </router-link>

        <router-link to="/membershipPlans" class="menu-card hover:bg-white/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12 sm:h-16 sm:w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h2 class="text-base sm:text-xl font-bold mt-2">Planes</h2>
        </router-link>

        <router-link to="/Membership" class="menu-card hover:bg-white/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12 sm:h-16 sm:w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2 class="text-base sm:text-xl font-bold mt-2">Membresías</h2>
        </router-link>

        <router-link to="/CashBox" class="menu-card hover:bg-white/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12 sm:h-16 sm:w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          <h2 class="text-base sm:text-xl font-bold mt-2">Caja</h2>
        </router-link>

        <router-link to="/statistics" class="menu-card hover:bg-white/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12 sm:h-16 sm:w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h2 class="text-base sm:text-xl font-bold mt-2">Estadísticas</h2>
        </router-link>

        <router-link to="/configuracion" class="menu-card hover:bg-white/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12 sm:h-16 sm:w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h2 class="text-base sm:text-xl font-bold mt-2">Ajustes</h2>
        </router-link>

        <button @click="logout" class="menu-card hover:bg-white/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12 sm:h-16 sm:w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <h2 class="text-base sm:text-xl font-bold mt-2">Salir</h2>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "vue-router";
import api from "@/axios";
import Swal from "sweetalert2";

const auth = useAuthStore();
const router = useRouter();
const user = auth.user;

// Solo necesitamos stats para las tarjetas de arriba
const stats = ref({});

onMounted(async () => {
  try {
    const { data } = await api.get("/memberships/stats");
    stats.value = data;
  } catch (error) {
    console.error("Error cargando stats:", error);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "Error cargando estadísticas",
      showConfirmButton: false,
      timer: 3000,
    });
  }
});

const logout = () => {
  auth.logout();
  router.push("/");
};
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

.stat-card {
  @apply rounded-xl shadow-lg p-5 text-left text-white transition-transform duration-200 hover:scale-105;
}

.menu-card {
  @apply rounded-xl shadow-lg p-6 text-center transition-all duration-200 flex flex-col items-center justify-center cursor-pointer text-white hover:shadow-2xl hover:-translate-y-1 active:scale-95 bg-transparent border-2 border-white;
}
</style>
