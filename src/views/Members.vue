<template>
  <div
    class="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
  >
    <Sidebar />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h1 class="text-2xl font-bold mb-4 ml-12 sm:mb-0">👥 Clientes</h1>
      <div class="flex flex-wrap ml-24 gap-3">
        <router-link
          to="/Menu"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow text-sm"
        >
          🏠 Inicio
        </router-link>
        <button
          @click="abrirModalRegistro"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow text-sm"
        >
          ➕ Agregar Cliente
        </button>
      </div>
    </div>

    <!-- Buscador -->
    <div class="mb-6">
      <input
        v-model="busqueda"
        type="text"
        placeholder="🔍 Buscar por nombre o teléfono"
        class="w-full border px-4 py-2 rounded shadow-sm text-black"
      />
    </div>

    <!-- Lista de clientes -->
    <div v-if="loading" class="text-gray-300">Cargando Clientes...</div>
    <div v-else>
      <div v-if="members.length === 0" class="text-gray-400">No hay Clientes registrados.</div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="member in miembrosFiltrados"
          :key="member.id"
          class="rounded-xl shadow-lg overflow-hidden transition hover:scale-[1.01] duration-150"
          :class="member.is_expired ? 'bg-red-500 text-white' : 'bg-white text-black'"
        >
          <div class="p-4 flex justify-between items-center">
            <div>
              <h2 class="text-lg font-bold">🧍 {{ member.name }}</h2>
              <p class="text-sm text-gray-600">📞 {{ member.phone }}</p>
              <p class="text-sm text-gray-600">🎂 {{ member.birth_date }}</p>
            </div>
            <button @click="toggleDetalle(member.id)" class="text-blue-600 hover:underline text-sm">
              {{ detallesAbiertos.includes(member.id) ? "Ocultar" : "Ver más" }}
            </button>
          </div>

          <!-- Detalle Expandible -->
          <div
            v-if="detallesAbiertos.includes(member.id)"
            class="px-4 pb-4 text-sm text-gray-700 space-y-2"
          >
            <p>📧 {{ member.email || "Sin email registrado" }}</p>
            <p>⚖️ Peso: {{ member.peso ?? "N/D" }} kg</p>
            <p>📏 Estatura: {{ member.estatura ?? "N/D" }} cm</p>
            <p>🧬 Sexo: {{ member.sexo || "N/D" }}</p>
            <p>🩺 Antecedentes: {{ member.medical_history || "Ninguno" }}</p>

            <!-- Acciones -->
            <div class="pt-2 flex gap-3 flex-wrap">
              <router-link
                :to="{ name: 'MemberDetail', params: { id: member.id } }"
                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
              >
                Ver detalle
              </router-link>

              <a
                :href="`https://wa.me/${formatearTelefono(member.phone)}`"
                target="_blank"
                class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                v-if="member.phone"
              >
                WhatsApp
              </a>

              <router-link
                :to="{ name: 'MemberEdit', params: { id: member.id } }"
                class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
              >
                Editar
              </router-link>

              <!-- Nuevo botón para asignar membresía -->
              <button
                @click="abrirModalMembresia(member)"
                class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs"
              >
                Asignar membresía
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Registro Cliente -->
    <div
      v-if="modalRegistro"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white text-black w-full max-w-lg p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]"
      >
        <h2 class="text-xl font-bold mb-4">Registrar nuevo cliente</h2>
        <form @submit.prevent="registrarMiembro">
          <input
            v-model="nuevoMiembro.name"
            type="text"
            required
            placeholder="Nombre"
            class="w-full mb-2 p-2 border rounded"
          />
          <input
            v-model="nuevoMiembro.email"
            type="email"
            placeholder="Email"
            class="w-full mb-2 p-2 border rounded"
          />
          <input
            v-model="nuevoMiembro.phone"
            type="text"
            required
            placeholder="Teléfono"
            class="w-full mb-2 p-2 border rounded"
          />
          <label class="block mb-1 text-sm">Fecha de nacimiento</label>
          <input
            v-model="nuevoMiembro.birth_date"
            type="date"
            required
            class="w-full mb-4 p-2 border rounded"
          />
          <label class="block mb-1 text-sm">Sexo</label>
          <select v-model="nuevoMiembro.sexo" class="w-full mb-2 p-2 border rounded">
            <option disabled value="">Seleccione una opción</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="no binario">No binario</option>
            <option value="prefiere no decirlo">Prefiere no decirlo</option>
            <option value="otro">Otro</option>
          </select>
          <label class="block mb-1 text-sm">Estatura (m)</label>
          <input
            v-model.number="nuevoMiembro.estatura"
            type="number"
            step="0.01"
            min="0"
            placeholder="Ej. 1.70"
            class="w-full mb-2 p-2 border rounded"
          />
          <label class="block mb-1 text-sm">Peso (kg)</label>
          <input
            v-model.number="nuevoMiembro.peso"
            type="number"
            step="0.1"
            min="0"
            placeholder="Ej. 70.5"
            class="w-full mb-2 p-2 border rounded"
          />
          <label class="block mb-1 text-sm">Antecedentes médicos</label>
          <textarea
            v-model="nuevoMiembro.medical_history"
            rows="3"
            placeholder="Ej. Asma, diabetes..."
            class="w-full mb-4 p-2 border rounded"
          ></textarea>
          <div class="flex justify-end gap-3">
            <button type="button" @click="cerrarModalRegistro" class="text-gray-600 px-4 py-2">
              Cancelar
            </button>
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Asignar Membresía -->
    <div
      v-if="modalMembresia"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white text-black w-full max-w-md p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-bold mb-4">Asignar membresía a {{ clienteSeleccionado?.name }}</h2>
        <form @submit.prevent="guardarMembresia">
          <label class="block mb-1 text-sm">Plan</label>
          <select v-model="nuevaMembresia.plan_id" class="w-full border rounded px-3 py-2" required>
            <option disabled value="">Seleccione un plan</option>
            <option v-for="plan in planes" :key="plan.id" :value="plan.id">
              {{ plan.name }}
            </option>
          </select>

          <label class="block mb-1 text-sm">Fecha de inicio</label>
          <input
            v-model="nuevaMembresia.start_date"
            type="date"
            class="w-full mb-4 p-2 border rounded"
            required
          />
          <div class="flex justify-end gap-3">
            <button type="button" @click="cerrarModalMembresia" class="text-gray-600 px-4 py-2">
              Cancelar
            </button>
            <button
              type="submit"
              class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              Asignar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/axios";
import Sidebar from "@/views/Sidebar.vue";

const members = ref([]);
const planes = ref([]);
const loading = ref(true);
const busqueda = ref("");
const detallesAbiertos = ref([]);

const modalRegistro = ref(false);
const modalMembresia = ref(false);
const clienteSeleccionado = ref(null);

const nuevoMiembro = ref({
  name: "",
  email: "",
  phone: "",
  birth_date: "",
  medical_history: "",
  sexo: "",
  peso: null,
  estatura: null,
});

const nuevaMembresia = ref({
  plan_id: "",
  start_date: "",
  end_date: "",
});

const abrirModalRegistro = () => (modalRegistro.value = true);
const cerrarModalRegistro = () => (modalRegistro.value = false);

const abrirModalMembresia = (cliente) => {
  clienteSeleccionado.value = cliente;
  modalMembresia.value = true;
};

const cerrarModalMembresia = () => {
  modalMembresia.value = false;
  nuevaMembresia.value = { plan_id: "", start_date: "", end_date: "" };
};

const toggleDetalle = (id) => {
  if (detallesAbiertos.value.includes(id)) {
    detallesAbiertos.value = detallesAbiertos.value.filter((i) => i !== id);
  } else {
    detallesAbiertos.value.push(id);
  }
};

const miembrosFiltrados = computed(() => {
  return members.value.filter(
    (member) =>
      member.name.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      member.email.toLowerCase().includes(busqueda.value.toLowerCase())
  );
});

function formatearTelefono(numero) {
  if (!numero) return "";
  let limpio = numero.toString().replace(/\D/g, "");
  if (!limpio.startsWith("57")) limpio = "57" + limpio;
  return limpio;
}

const cargarMiembros = async () => {
  try {
    const { data } = await api.get("/members");
    members.value = data;
  } catch (e) {
    console.error("Error al cargar miembros:", e);
  } finally {
    loading.value = false;
  }
};

const cargarPlanes = async () => {
  try {
    const { data } = await api.get("/membershipPlan");
    planes.value = data;
  } catch (e) {
    console.error("Error al cargar planes:", e);
  }
};

const registrarMiembro = async () => {
  try {
    await api.post("/members", nuevoMiembro.value);
    cerrarModalRegistro();
    cargarMiembros();
  } catch (e) {
    console.error("Error al registrar miembro:", e);
    alert("Error al registrar el miembro.");
  }
};

const guardarMembresia = async () => {
  try {
    const plan = planes.value.find((p) => p.id === form.value.plan_id);
    const inicio = dayjs(form.value.start_date);
    let fin = inicio;

    switch (plan.frequency) {
      case "daily":
        fin = inicio.add(1, "day");
        break;
      case "weekly":
        fin = inicio.add(1, "week");
        break;
      case "biweekly":
        fin = inicio.add(15, "day");
        break;
      case "monthly":
        fin = inicio.add(1, "month");
        break;
    }

    form.value.end_date = fin.format("YYYY-MM-DD");

    await api.post("/memberships", form.value);

    cerrarModal();
    await cargarMembresias();
    alert("Membresía asignada correctamente");
  } catch (error) {
    console.error("Error al asignar membresía:", error);
    alert("Error al asignar la membresía.");
  }
};

onMounted(() => {
  cargarMiembros();
  cargarPlanes();
});
</script>

<style>
@keyframes blink {
  50% {
    opacity: 0.8;
  }
}
.bg-red-500 {
  animation: blink 1s infinite;
}
</style>
