
<!-- src/components/Sidebar.vue -->
<template>
  <div>
    <!-- Botón hamburguesa -->
    <button @click="toggle" class="fixed top-4 left-4 z-50 text-white bg-blue-600 px-3 py-2 rounded shadow-lg">
      <i class="bi bi-list"></i>
    </button>

    <!-- Sidebar -->
    <div
      class="fixed top-0 left-0 h-full bg-white shadow-lg w-64 z-40 transform transition-transform duration-300"
      :class="{ '-translate-x-full': !open }"
    >
      <div class="p-6 border-b text-lg font-bold text-blue-700 ml-16">
        CosmoGym <i class="bi bi-person-arms-up"></i>
      </div>

      <nav class="flex flex-col p-4 space-y-2 text-gray-800">
        <router-link @click="toggle" to="/Menu" class="hover:text-blue-600"><i class="bi bi-house-door"></i> Inicio</router-link>
        <router-link @click="toggle" to="/members" class="hover:text-blue-600"><i class="bi bi-person"></i> Clientes</router-link>
        <router-link @click="toggle" to="/Membership" class="hover:text-blue-600"><i class="bi bi-heart-pulse"></i> Membresías</router-link>
        <router-link @click="toggle" to="/payments" class="hover:text-blue-600"><i class="bi bi-cash-stack"></i> Pagos</router-link>
        <router-link @click="toggle" to="/membershipPlans" class="hover:text-blue-600"><i class="bi bi-box-seam"></i> Planes</router-link>
        <router-link @click="toggle" to="/configuracion" class="hover:text-blue-600"><i class="bi bi-gear"></i> Configuración</router-link>
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
