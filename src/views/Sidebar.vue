
<!-- src/components/Sidebar.vue -->
<template>
  <div>
    <!-- Botón hamburguesa -->
    <button @click="toggle" class="fixed top-4 left-4 z-50 text-white bg-blue-600 px-3 py-2 rounded shadow-lg">
      ☰
    </button>

    <!-- Sidebar -->
    <div
      class="fixed top-0 left-0 h-full bg-white shadow-lg w-64 z-40 transform transition-transform duration-300"
      :class="{ '-translate-x-full': !open }"
    >
      <div class="p-6 border-b text-lg font-bold text-blue-700 ml-16">
        CosmoGym 🏋️
      </div>

      <nav class="flex flex-col p-4 space-y-2 text-gray-800">
        <router-link @click="toggle" to="/Menu" class="hover:text-blue-600">🏠 Inicio</router-link>
        <router-link @click="toggle" to="/members" class="hover:text-blue-600">👤 Clientes</router-link>
        <router-link @click="toggle" to="/Membership" class="hover:text-blue-600">💪 Membresías</router-link>
        <router-link @click="toggle" to="/payments" class="hover:text-blue-600">💰 Pagos</router-link>
        <router-link @click="toggle" to="/membershipPlans" class="hover:text-blue-600">📦 Planes</router-link>
        <router-link @click="toggle" to="/configuracion" class="hover:text-blue-600">⚙️ Configuración</router-link>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const open = ref(false)
const toggle = () => {
  open.value = !open.value
}
</script>

<style scoped>
/* Evita que el sidebar esté encima del contenido cuando está oculto */
.translate-x-full {
  transform: translateX(-100%);
}
</style>
