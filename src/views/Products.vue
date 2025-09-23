<template>
  <div class="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
    <Sidebar />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h1 class="text-2xl font-bold mb-4 ml-12 sm:mb-0">📦 Productos</h1>
      <div class="flex flex-wrap ml-24 gap-3">
        <router-link to="/Menu" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow text-sm">
          🏠 Inicio
        </router-link>
        <button @click="abrirModalRegistro" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow text-sm">
          ➕ Agregar Producto
        </button>
      </div>
    </div>

    <!-- Buscador -->
    <div class="mb-6">
      <input
        v-model="busqueda"
        type="text"
        placeholder="🔍 Buscar producto por nombre"
        class="w-full border px-4 py-2 rounded shadow-sm text-black"
      />
    </div>

    <!-- Lista de productos -->
    <div v-if="loading" class="text-gray-300">Cargando productos...</div>
    <div v-else>
      <div v-if="productosFiltrados.length === 0" class="text-gray-400">No hay productos registrados.</div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="producto in productosFiltrados"
          :key="producto.id"
          class="bg-white text-black rounded-xl shadow-lg overflow-hidden transition hover:scale-[1.01] duration-150"
        >
          <div class="p-4">
            <h2 class="text-lg font-bold">📦 {{ producto.name }}</h2>
            <p v-if="producto.description" class="text-sm text-gray-700 mb-1">
              {{ producto.description }}
            </p>
            <p class="text-sm text-gray-600">💲 Precio: ${{ producto.price }}</p>
            <p class="text-sm text-gray-600">📦 Stock: {{ producto.stock }}</p>
          </div>

          <!-- Acciones -->
          <div class="flex gap-3 p-4 border-t">
            <button @click="editarProducto(producto)" class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs">
              ✏️ Editar
            </button>
            <button @click="eliminarProducto(producto.id)" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs">
              🗑️ Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Registro/Edición Producto -->
    <div v-if="modalRegistro" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white text-black w-full max-w-lg p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
        <h2 class="text-xl font-bold mb-4">{{ editando ? 'Editar producto' : 'Registrar nuevo producto' }}</h2>
        <form @submit.prevent="guardarProducto">
          <input
            v-model="productoForm.name"
            type="text"
            required
            placeholder="Nombre del producto"
            class="w-full mb-2 p-2 border rounded"
          />
          <textarea
            v-model="productoForm.description"
            placeholder="Descripción (opcional)"
            class="w-full mb-2 p-2 border rounded"
            rows="3"
          ></textarea>
          <input
            v-model.number="productoForm.price"
            type="number"
            required
            min="0"
            step="0.01"
            placeholder="Precio"
            class="w-full mb-2 p-2 border rounded"
          />
          <input
            v-model.number="productoForm.stock"
            type="number"
            required
            min="0"
            step="1"
            placeholder="Stock"
            class="w-full mb-4 p-2 border rounded"
          />
          <div class="flex justify-end gap-3">
            <button type="button" @click="cerrarModalRegistro" class="text-gray-600 px-4 py-2">Cancelar</button>
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              {{ editando ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/axios'
import Sidebar from '@/views/Sidebar.vue'

const productos = ref([])
const loading = ref(true)
const busqueda = ref('')
const modalRegistro = ref(false)
const editando = ref(false)

const productoForm = ref({
  id: null,
  name: '',
  description: '',
  price: 0,
  stock: 0
})

// Abrir y cerrar modal
const abrirModalRegistro = () => {
  productoForm.value = { id: null, name: '', description: '', price: 0, stock: 0 }
  editando.value = false
  modalRegistro.value = true
}
const cerrarModalRegistro = () => (modalRegistro.value = false)

// Cargar productos
const cargarProductos = async () => {
  try {
    const { data } = await api.get('/supplementProduct')
    productos.value = data
  } catch (e) {
    console.error('Error al cargar productos:', e)
    alert('Error al cargar los productos.')
  } finally {
    loading.value = false
  }
}

// Guardar producto (crear o actualizar)
const guardarProducto = async () => {
  try {
    const payload = {
      name: productoForm.value.name,
      description: productoForm.value.description || null,
      price: productoForm.value.price,
      stock: productoForm.value.stock
    }

    if (editando.value && productoForm.value.id) {
      await api.put(`/supplementProduct/${productoForm.value.id}`, payload)
    } else {
      await api.post('/supplementProduct', payload)
    }
    cerrarModalRegistro()
    alert(`Producto ${editando.value ? 'actualizado' : 'guardado'} exitosamente.`)
    cargarProductos()
  } catch (e) {
    console.error('Error al guardar producto:', e)
    alert('Error al guardar el producto.')
  }
}

// Editar producto
const editarProducto = (producto) => {
  productoForm.value = {
    id: producto.id ?? null,
    name: producto.name ?? '',
    description: producto.description ?? '',
    price: Number(producto.price ?? 0),
    stock: Number(producto.stock ?? 0)
  }
  editando.value = true
  modalRegistro.value = true
}

// Eliminar producto
const eliminarProducto = async (id) => {
  if (confirm('¿Seguro que deseas eliminar este producto?')) {
    try {
      await api.delete(`/supplementProduct/${id}`)
      cargarProductos()
    } catch (e) {
      console.error('Error al eliminar producto:', e)
      alert('Error al eliminar el producto.')
    }
  }
}

// Filtrar productos por nombre
const productosFiltrados = computed(() => {
  const q = busqueda.value.toLowerCase()
  return productos.value.filter(p => (p.name || '').toLowerCase().includes(q))
})

onMounted(() => {
  cargarProductos()
})
</script>
