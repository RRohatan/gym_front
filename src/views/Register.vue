<template>
<div
  class="w-screen min-h-screen bg-cover bg-center bg-no-repeat flex flex-col md:flex-row"
  style="background-image: url('/img/fondo_sin_letra.png')"
>
    <!-- Marca CosmoGym con animación -->
    <div class="flex justify-center items-center md:flex-1 h-32 md:h-auto">
      <h1 class="text-white text-4xl md:text-6xl font-extrabold tracking-wider animate-logo">
        COSMOGYM
      </h1>
    </div>

    <!-- Formulario -->
    <div class="flex justify-center items-center flex-1 px-4 pb-10 md:pb-0">
      <div class="bg-white shadow-lg rounded-2xl p-6 md:p-10 w-full max-w-sm">
        <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Registrarse</h2>

        <form @submit.prevent="register">
          <div class="mb-4">
            <label class="block text-gray-600 text-sm mb-1">Nombre</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none text-black focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div class="mb-4">
            <label class="block text-gray-600 text-sm mb-1">Correo</label>
            <input
              v-model="form.email"
              type="email"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none text-black focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div class="mb-4">
            <label class="block text-gray-600 text-sm mb-1">Nombre del Gimnasio</label>
            <input
              v-model="form.gym_name"
              type="text"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none text-black focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div class="mb-4">
            <label class="block text-gray-600 text-sm mb-1">Contraseña</label>
            <input
              v-model="form.password"
              type="password"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none text-black focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div class="mb-6">
            <label class="block text-gray-600 text-sm mb-1">Confirmar contraseña</label>
            <input
              v-model="form.password_confirmation"
              type="password"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none text-black focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <button
            type="submit"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition duration-200"
          >
            Registrar
          </button>
        </form>

        <div class="mt-4 text-center">
          <span class="text-sm text-gray-600">¿Ya tienes cuenta?</span>
          <router-link to="/" class="text-blue-600 hover:underline ml-1">
            Inicia sesión
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeScale {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-logo {
  animation: fadeScale 1.2s ease-out forwards;
  text-shadow: 0 2px 10px rgba(255, 0, 0, 0.4);
}

body {
  margin: 0;
  background-color: black;
  overflow-x: hidden;
}

</style>


<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import api from 'axios' // ✅ Esto ya usa tu baseURL desde .env
import { useAuthStore } from '@/stores/useAuthStore'
import Swal from 'sweetalert2'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  gym_name: ''
})

const register = async () => {
  try {
    const response = await api.post('/register', form)

    auth.setToken(response.data.access_token)

    await Swal.fire({
      title: '¡Registro exitoso!',
      text: 'Tu cuenta ha sido creada correctamente.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#2563EB',
      background: '#f9f9f9',
      backdrop: `rgba(0,0,123,0.4) left top no-repeat`,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    })

    router.push({ name: 'Login' })

  } catch (error: any) {
    Swal.fire({
      title: 'Error en el registro',
      text: error?.response?.data?.message || 'Ocurrió un error desconocido.',
      icon: 'error',
      confirmButtonText: 'Cerrar'
    })
  }
}
</script>
