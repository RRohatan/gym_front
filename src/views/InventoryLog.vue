<template>
  <div
    class="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
  >
    <div class="">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 class="text-2xl font-bold ml-12 sm:ml-0">📦 Movimientos de Inventario</h1>
        <router-link to="/Products" class="btn btn-dark">📦 Inventario</router-link>
      </div>

      <div class="bg-gray-800 p-1 rounded-xl inline-flex mb-6 shadow-lg border border-gray-700">
        <button
          @click="tab = 'ventas'"
          class="px-6 py-2 rounded-lg font-bold transition text-sm sm:text-base"
          :class="
            tab === 'ventas' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
          "
        >
          🛒 Reporte de Ventas
        </button>
        <button
          @click="tab = 'compras'"
          class="px-6 py-2 rounded-lg font-bold transition text-sm sm:text-base"
          :class="
            tab === 'compras' ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-white'
          "
        >
          🚛 Compras a Proveedores
        </button>
      </div>

      <div
        v-if="tab === 'ventas'"
        class="bg-white rounded-2xl shadow-xl p-4 sm:p-6 text-gray-800 animate-fade-in"
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-blue-800">Historial de Ventas</h2>
          <div class="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
            Total Vendido:
            <span class="font-bold text-blue-700">{{ formatCurrency(totalVentas) }}</span>
          </div>
        </div>

        <div class="overflow-x-auto rounded-lg border border-gray-100">
          <table class="w-full text-sm text-left">
            <thead class="bg-blue-50 text-blue-800 uppercase text-xs font-bold">
              <tr>
                <th class="p-3">Fecha</th>
                <th class="p-3">Producto</th>
                <th class="p-3 text-center">Cant.</th>
                <th class="p-3 text-right">Precio Unit.</th>
                <th class="p-3 text-right">Total</th>
                <th class="p-3">Cliente</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="ventas.length === 0">
                <td colspan="6" class="p-8 text-center text-gray-400 italic">
                  No hay ventas registradas aún.
                </td>
              </tr>
              <tr v-for="v in ventas" :key="v.id" class="hover:bg-gray-50">
                <td class="p-3 text-gray-500">{{ formatDate(v.created_at) }}</td>
                <td class="p-3 font-bold">{{ v.product?.name || "Producto eliminado" }}</td>
                <td class="p-3 text-center bg-gray-50 rounded font-mono">{{ v.quantity }}</td>
                <td class="p-3 text-right">{{ formatCurrency(v.total / v.quantity) }}</td>
                <td class="p-3 text-right font-bold text-green-600">
                  {{ formatCurrency(v.total) }}
                </td>
                <td class="p-3 text-xs">{{ v.member?.name || "Público General" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        v-if="tab === 'compras'"
        class="bg-white rounded-2xl shadow-xl p-4 sm:p-6 text-gray-800 animate-fade-in"
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-green-800">Historial de Compras</h2>
          <button @click="abrirModalCompra" class="btn btn-success text-sm flex items-center gap-2">
            ➕ Registrar Nueva Compra
          </button>
        </div>

        <div class="overflow-x-auto rounded-lg border border-gray-100">
          <table class="w-full text-sm text-left">
            <thead class="bg-green-50 text-green-800 uppercase text-xs font-bold">
              <tr>
                <th class="p-3">Fecha</th>
                <th class="p-3">Producto</th>
                <th class="p-3 text-center">Cant. Comprada</th>
                <th class="p-3 text-right">Costo Total</th>
                <th class="p-3">Proveedor / Notas</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="compras.length === 0">
                <td colspan="5" class="p-8 text-center text-gray-400 italic">
                  No has registrado compras de reabastecimiento.
                </td>
              </tr>
              <tr v-for="c in compras" :key="c.id" class="hover:bg-gray-50">
                <td class="p-3 text-gray-500">{{ formatDate(c.purchase_date) }}</td>
                <td class="p-3 font-bold">{{ c.product?.name }}</td>
                <td class="p-3 text-center font-bold text-green-700">+{{ c.quantity }}</td>
                <td class="p-3 text-right text-gray-600">{{ formatCurrency(c.total_cost) }}</td>
                <td class="p-3 text-xs text-gray-500">{{ c.supplier || "—" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
    >
      <div class="bg-white w-full max-w-md p-6 rounded-xl shadow-2xl text-gray-800">
        <h2 class="text-xl font-bold mb-4 border-b pb-2 text-green-700">
          🚛 Reabastecer Inventario
        </h2>

        <form @submit.prevent="registrarCompra" class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Producto</label>
            <select
              v-model="form.product_id"
              required
              class="w-full border p-2 rounded-lg bg-white outline-none focus:ring-2 focus:ring-green-500"
            >
              <option disabled value="">Seleccione...</option>
              <option v-for="p in productos" :key="p.id" :value="p.id">
                {{ p.name }} (Stock actual: {{ p.stock }})
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Cantidad</label>
              <input
                v-model.number="form.quantity"
                type="number"
                min="1"
                required
                class="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-green-500 font-mono text-lg"
                placeholder="0"
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Costo Total ($)</label>
              <input
                v-model.number="form.total_cost"
                type="number"
                min="0"
                required
                class="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-green-500 font-mono text-lg"
                placeholder="$"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1"
              >Nuevo Precio de Venta (Opcional)</label
            >
            <input
              v-model.number="form.new_price"
              type="number"
              min="0"
              class="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-green-500 font-mono text-lg"
              placeholder="Dejar vacío para mantener el actual"
            />
            <p class="text-xs text-gray-500 mt-1">
              Si ingresa un valor, se actualizará el precio de venta del producto.
            </p>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Proveedor (Opcional)</label>
            <input
              v-model="form.supplier"
              type="text"
              class="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ej: Distribuidora XYZ"
            />
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t mt-2">
            <button type="button" @click="showModal = false" class="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-success">✅ Registrar Entrada</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "@/axios";
import dayjs from "dayjs";
import Swal from "sweetalert2";

const tab = ref("ventas");
const ventas = ref([]);
const compras = ref([]);
const productos = ref([]);
const showModal = ref(false);

const form = ref({
  product_id: "",
  quantity: "",
  total_cost: "",
  supplier: "",
  new_price: "", // Added new_price
});

onMounted(() => {
  cargarVentas();
  cargarCompras();
  cargarProductos();
});

// CARGAS DE DATOS
const cargarVentas = async () => {
  try {
    const { data } = await api.get("/supplementSale");
    ventas.value = data.data; // La API devuelve { data: [...] }
  } catch (e) {
    console.error(e);
  }
};

const cargarCompras = async () => {
  try {
    const { data } = await api.get("/product-purchases"); // Ahora sí existe
    compras.value = data;
  } catch (e) {
    console.error(e);
  }
};

const cargarProductos = async () => {
  const { data } = await api.get("/supplementProduct");
  productos.value = data;
};

// ACCIONES
const abrirModalCompra = () => {
  form.value = { product_id: "", quantity: "", total_cost: "", supplier: "", new_price: "" };
  showModal.value = true;
};

const registrarCompra = async () => {
  try {
    await api.post("/product-purchases", form.value); // Endpoint de guardado
    Swal.fire({
      icon: "success",
      title: "Compra Registrada",
      text: "El stock ha sido actualizado correctamente.",
      timer: 2000,
      showConfirmButton: false,
    });
    showModal.value = false;
    cargarCompras();
    cargarProductos(); // Para actualizar stocks en el select
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Hubo un error al registrar la compra.",
    });
    console.error(error);
  }
};

// UTILIDADES
const totalVentas = computed(() => ventas.value.reduce((sum, v) => sum + Number(v.total), 0));
const formatCurrency = (val) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(val);
const formatDate = (d) => dayjs(d).format("DD/MM/YYYY hh:mm A");
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
