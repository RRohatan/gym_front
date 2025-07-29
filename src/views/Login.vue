<template>
  <div
    class="w-screen h-screen bg-cover bg-center bg-no-repeat flex flex-col md:flex-row"
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
        <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Iniciar Sesión</h2>

        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label class="block text-gray-600 text-sm mb-1">Correo</label>
            <input
              v-model="email"
              type="email"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none text-black focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div class="mb-6">
            <label class="block text-gray-600 text-sm mb-1">Contraseña</label>
            <input
              v-model="password"
              type="password"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none text-black focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <button
            type="submit"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition duration-200"
          >
            Entrar
          </button>
        </form>

        <div class="mt-4 text-center">
          <span class="text-sm text-gray-600">¿No tienes cuenta?</span>
          <router-link to="/register" class="text-blue-600 hover:underline ml-1">
            Regístrate
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
</style>


<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import axios from 'axios'

const email = ref('')
const password = ref('')
const router = useRouter()
const auth = useAuthStore()

const handleLogin = async () => {
  try {
    const response = await axios.post('http://127.0.0.1:8000/api/login', {
      email: email.value,
      password: password.value
    })

    auth.setToken(response.data.access_token)
    router.push('/Menu')
  } catch (error) {
    alert('Credenciales incorrectas')
    console.error(error)
  }
}
</script>

