<template>
  <div
    class="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
  >
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <h1 class="text-2xl font-bold ml-12 md:ml-0">📦 Inventario</h1>
      <div class="flex gap-2 w-full md:w-auto">
        <router-link to="/Menu" class="btn btn-dark flex-1 md:flex-none justify-center">
          🏠 <span class="hidden sm:inline">Inicio</span>
        </router-link>
        <button
          @click="abrirModalRegistro"
          class="btn btn-success flex-1 md:flex-none justify-center text-sm"
        >
          ➕ Agregar
        </button>
      </div>
    </div>

    <div class="mb-6">
      <input
        v-model="busqueda"
        type="text"
        placeholder="🔍 Buscar producto..."
        class="w-full border px-4 py-3 rounded-xl shadow-sm text-black focus:ring-2 focus:ring-blue-500 outline-none text-base"
      />
    </div>

    <div v-if="loading" class="text-gray-300 text-center mt-10">Cargando...</div>
    <div v-else>
      <div v-if="productosFiltrados.length === 0" class="text-gray-400 text-center mt-10">
        No encontrado.
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
        <div
          v-for="producto in productosFiltrados"
          :key="producto.id"
          class="bg-white text-black rounded-xl shadow-lg overflow-hidden flex flex-col justify-between"
        >
          <div class="p-4">
            <div class="flex justify-between items-start">
              <h2 class="text-lg font-bold leading-tight">{{ producto.name }}</h2>
              <span class="text-xs px-2 py-1 rounded bg-gray-100 font-bold border"
                >Stock: {{ producto.stock }}</span
              >
            </div>
            <p v-if="producto.description" class="text-sm text-gray-500 mt-1 line-clamp-2">
              {{ producto.description }}
            </p>
            <p class="text-xl font-bold text-blue-600 mt-2">${{ producto.price }}</p>
          </div>

          <div class="flex p-2 border-t bg-gray-50 gap-2">
            <button
              @click="editarProducto(producto)"
              class="btn btn-indigo btn-sm flex-1 justify-center py-2"
            >
              ✏️ Editar
            </button>
            <button
              @click="eliminarProducto(producto.id)"
              class="btn btn-danger btn-sm flex-1 justify-center py-2"
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="modalRegistro"
      class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
    >
      <div
        class="bg-white text-black w-full sm:max-w-md p-6 rounded-t-2xl sm:rounded-xl shadow-2xl overflow-y-auto max-h-[85vh] animate-slide-up"
      >
        <h2 class="text-lg font-bold mb-4">{{ editando ? "Editar" : "Nuevo Producto" }}</h2>
        <form @submit.prevent="guardarProducto" class="space-y-3">
          <input
            v-model="productoForm.name"
            type="text"
            required
            placeholder="Nombre"
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <textarea
            v-model="productoForm.description"
            placeholder="Descripción"
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            rows="2"
          ></textarea>

          <div class="flex gap-3">
            <div class="flex-1">
              <label class="text-xs font-bold text-gray-500 uppercase">Precio</label>
              <input
                v-model.number="productoForm.price"
                type="number"
                required
                min="0"
                class="w-full p-3 border rounded-lg font-mono text-lg"
              />
            </div>
            <div class="flex-1">
              <label class="text-xs font-bold text-gray-500 uppercase">Stock</label>
              <input
                v-model.number="productoForm.stock"
                type="number"
                required
                min="0"
                class="w-full p-3 border rounded-lg font-mono text-lg"
              />
            </div>
          </div>

          <div class="flex gap-3 pt-4 border-t mt-2">
            <button
              type="button"
              @click="cerrarModalRegistro"
              class="btn btn-secondary flex-1 justify-center py-3"
            >
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary flex-1 justify-center py-3">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
// (Mismo script, solo copia y pega si lo borraste)
import { ref, computed, onMounted } from "vue";
import api from "@/axios";
const productos = ref([]);
const loading = ref(true);
const busqueda = ref("");
const modalRegistro = ref(false);
const editando = ref(false);
const productoForm = ref({ id: null, name: "", description: "", price: 0, stock: 0 });
const abrirModalRegistro = () => {
  productoForm.value = { id: null, name: "", description: "", price: 0, stock: 0 };
  editando.value = false;
  modalRegistro.value = true;
};
const cerrarModalRegistro = () => (modalRegistro.value = false);
const cargarProductos = async () => {
  try {
    const { data } = await api.get("/supplementProduct");
    productos.value = data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};
const guardarProducto = async () => {
  try {
    const payload = { ...productoForm.value };
    if (editando.value && productoForm.value.id)
      await api.put(`/supplementProduct/${productoForm.value.id}`, payload);
    else await api.post("/supplementProduct", payload);
    cerrarModalRegistro();
    cargarProductos();
  } catch (e) {
    console.error(e);
  }
};
const editarProducto = (producto) => {
  productoForm.value = { ...producto };
  editando.value = true;
  modalRegistro.value = true;
};
const eliminarProducto = async (id) => {
  if (confirm("¿Eliminar?")) {
    try {
      await api.delete(`/supplementProduct/${id}`);
      cargarProductos();
    } catch (e) {
      console.error(e);
    }
  }
};
const productosFiltrados = computed(() => {
  const q = busqueda.value.toLowerCase();
  return productos.value.filter((p) => (p.name || "").toLowerCase().includes(q));
});
onMounted(() => cargarProductos());
</script>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>
