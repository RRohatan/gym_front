<template>
  <div class="h-screen bg-[var(--color-bg)] flex flex-col text-default overflow-hidden">

    <header class="bg-[var(--color-surface)] shadow-sm px-4 py-3 flex justify-between items-center z-10 shrink-0 border-b border-default-soft">
      <div class="flex items-center gap-2">
        <h1 class="text-lg md:text-xl font-bold text-default hidden sm:block">Punto de Venta</h1>
      </div>

      <div class="flex gap-2">
        <router-link
          to="/Products"
          class="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 active:scale-95 transition"
        >
          <span class="hidden sm:inline">Inventario</span>
        </router-link>

        <router-link
          to="/Menu"
          class="bg-gray-900 text-white px-3 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 active:scale-95 transition shadow"
        >
          <span class="hidden sm:inline">Salir</span>
        </router-link>
      </div>
    </header>

    <div class="flex-1 p-2 sm:p-4 flex flex-col lg:flex-row gap-4 overflow-hidden">

      <div class="w-full lg:w-2/3 flex flex-col gap-3 h-1/2 lg:h-full">

        <div class="bg-[var(--color-surface)] p-3 rounded-xl shadow-sm flex flex-col sm:flex-row gap-3 shrink-0 border border-default-soft">
          <div class="flex-1">
            <BaseSelect
              v-model="selectedMemberId"
              :options="[
                { value: null, label: '-- Cliente (Opcional) --' },
                ...members.map((m) => ({ value: m.id, label: m.name })),
              ]"
            />
          </div>
          <div class="flex-1">
            <div class="relative">
              <input v-model="search" type="text" placeholder="Buscar producto..." class="field-input text-sm">
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto pb-20 lg:pb-0 pr-1">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <div
              v-for="product in filteredProducts"
              :key="product.id"
              @click="addToCart(product)"
              class="bg-[var(--color-surface)] p-3 rounded-xl shadow-sm border border-transparent active:border-blue-500 active:bg-blue-50 cursor-pointer flex flex-col justify-between h-full relative"
            >
              <span
                :class="product.stock < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'"
                class="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full font-bold"
              >
                {{ product.stock }}
              </span>

              <div>
                <h3 class="font-bold text-default text-sm leading-tight line-clamp-2">{{ product.name }}</h3>
                <p class="text-lg font-bold text-blue-600 mt-1">${{ formatCurrency(product.price) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full lg:w-1/3 bg-[var(--color-surface)] rounded-t-xl lg:rounded-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] lg:shadow-lg flex flex-col h-1/2 lg:h-full z-20 border-t lg:border-t-0 border-default-soft">

        <div class="p-3 border-b border-default-soft flex justify-between items-center bg-[var(--color-surface-soft)] lg:bg-[var(--color-surface)] rounded-t-xl shrink-0">
          <h3 class="font-bold text-muted flex items-center gap-2">
            Ticket
            <span class="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">{{ cart.length }} items</span>
          </h3>
          <button @click="cart = []" v-if="cart.length > 0" class="text-xs text-red-500 hover:underline">Vaciar</button>
        </div>

        <div class="flex-1 overflow-y-auto p-2 space-y-2 bg-[var(--color-surface)]">
          <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center text-subtle opacity-50">
            <p class="text-sm">Carrito vacío</p>
          </div>

          <div v-for="(item, index) in cart" :key="index" class="flex justify-between items-center bg-[var(--color-surface-soft)] p-2 rounded-lg border border-default-soft text-sm">
            <div class="flex-1">
              <p class="font-bold text-default truncate">{{ item.name }}</p>
              <div class="text-xs text-muted">
                {{ item.quantity }} x ${{ formatCurrency(item.price) }}
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-bold text-muted">${{ formatCurrency(item.price * item.quantity) }}</span>
              <button @click="removeFromCart(index)" class="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 rounded-full active:scale-90">×</button>
            </div>
          </div>
        </div>

        <div class="p-3 bg-[var(--color-surface-soft)] border-t border-default-soft shrink-0">
          <div class="flex justify-between items-center mb-3">
            <span class="text-muted font-medium">Total a Pagar</span>
            <span class="text-2xl font-black text-default">${{ formatCurrency(totalCart) }}</span>
          </div>

          <button
            @click="procesarVenta"
            :disabled="cart.length === 0 || !selectedMemberId"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-[var(--color-overlay-strong)] disabled:text-subtle text-white py-3 rounded-xl font-bold shadow-lg text-lg disabled:cursor-not-allowed transition active:scale-95 flex justify-center items-center gap-2"
          >
            <template v-if="!selectedMemberId">Selecciona Cliente</template>
            <template v-else>COBRAR</template>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/axios'
import Swal from 'sweetalert2'
import { BaseSelect } from '@/components/ui'
import dayjs from 'dayjs'

const products = ref([])
const members = ref([])
const cart = ref([])
const search = ref('')
const selectedMemberId = ref(null)

const fetchData = async () => {
  try {
    const [resProd, resMemb] = await Promise.all([
      api.get('/supplementProduct'),
      api.get('/members')
    ])
    products.value = resProd.data
    members.value = resMemb.data
  } catch (e) {
    console.error(e)
    Swal.fire('Error de conexión', 'Revisa tu internet o el servidor', 'error')
  }
}

const filteredProducts = computed(() => {
  return products.value.filter(p =>
    p.name.toLowerCase().includes(search.value.toLowerCase()) && p.stock > 0
  )
})

const addToCart = (product) => {
  const existing = cart.value.find(item => item.id === product.id)

  if (existing) {
    if (existing.quantity < product.stock) {
      existing.quantity++
    } else {
      const Toast = Swal.mixin({
        toast: true,
        position: 'center',
        showConfirmButton: false,
        timer: 1500
      })
      Toast.fire({ icon: 'warning', title: '¡Stock máximo!' })
    }
  } else {
    cart.value.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      stock: product.stock
    })
  }
}

const removeFromCart = (index) => {
  cart.value.splice(index, 1)
}

const totalCart = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const formatCurrency = (val) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(val)

const procesarVenta = async () => {
  try {
    await api.post('/supplement-sales/bulk', {
      member_id: selectedMemberId.value,
      cart: cart.value,
      payment_method_id: 1,
      payment_method_name: 'Efectivo',
      paid_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
    })

    Swal.fire({
      title: '¡Venta Exitosa!',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    })

    cart.value = []
    fetchData()
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'No se pudo procesar', 'error')
  }
}

onMounted(() => fetchData())
</script>
