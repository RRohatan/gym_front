<template>
  <div
    class="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
  >
    <div class="bg-white text-gray-800 shadow-xl rounded-2xl p-4 sm:p-8">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 class="text-xl sm:text-2xl font-bold ml-12 sm:ml-16 flex items-center gap-2">
          🏋️ Membresías
          <span class="text-sm font-normal text-gray-500 hidden sm:inline"
            >| {{ tituloFiltro }}</span
          >
        </h1>
        <div class="flex gap-2 w-full md:w-auto">
          <router-link to="/Menu" class="btn btn-dark flex-1 md:flex-none justify-center"
            >🏠 Inicio</router-link
          >
          <button
            @click="showModal = true"
            class="btn btn-success flex-1 md:flex-none justify-center text-sm"
          >
            ➕ Asignar
          </button>
        </div>
      </div>

      <div class="flex overflow-x-auto pb-2 gap-2 mb-4 scrollbar-hide">
        <button
          @click="filtrarMembresias('')"
          class="btn btn-sm whitespace-nowrap"
          :class="statusFilter === '' ? 'btn-primary' : 'btn-secondary'"
        >
          Todos
        </button>
        <button
          @click="filtrarMembresias('active')"
          class="btn btn-sm whitespace-nowrap"
          :class="statusFilter === 'active' ? 'btn-primary' : 'btn-secondary'"
        >
          ✅ Activas
        </button>
        <button
          @click="filtrarMembresias('inactive_unpaid')"
          class="btn btn-sm whitespace-nowrap"
          :class="statusFilter === 'inactive_unpaid' ? 'btn-primary' : 'btn-secondary'"
        >
          ⏳ Por Pagar
        </button>
        <button
          @click="filtrarMembresias('expiring_soon')"
          class="btn btn-sm whitespace-nowrap"
          :class="statusFilter === 'expiring_soon' ? 'btn-primary' : 'btn-secondary'"
        >
          ⚠️ Vencen Pronto
        </button>
      </div>

      <div class="mb-4">
        <input
          v-model="busquedaMembresia"
          type="text"
          placeholder="🔍 Buscar miembro..."
          class="w-full px-4 py-2 border rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div class="overflow-x-auto rounded-lg border border-gray-100 shadow-sm">
        <div v-if="loading" class="text-center py-10 text-gray-400">Cargando...</div>

        <table v-else class="w-full text-sm min-w-[800px]">
          <thead class="bg-gray-100 text-gray-700">
            <tr>
              <th class="py-3 px-4 text-left">Cliente</th>
              <th class="py-3 px-4 text-left">Plan</th>
              <th class="py-3 px-4 text-left">Vigencia</th>
              <th class="py-3 px-4 text-center">Estado</th>
              <th class="py-3 px-4 text-right">Saldo</th>
              <th class="py-3 px-4 text-center">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr v-if="membresiasFiltradas.length === 0">
              <td colspan="6" class="py-10 text-center text-gray-400">
                No se encontraron resultados.
              </td>
            </tr>
            <tr v-for="m in membresiasFiltradas" :key="m.id" class="hover:bg-gray-50 transition">
              <td class="py-3 px-4 font-bold text-gray-700">{{ m.member?.name }}</td>

              <td class="py-3 px-4">
                {{ m.plan?.membership_type?.name }}
                <span class="text-xs text-gray-500 bg-gray-100 px-1 rounded ml-1">
                  {{ traducirFrecuencia(m.plan?.frequency) }}
                </span>
              </td>

              <td class="py-3 px-4 text-xs text-gray-500">
                {{ formatDate(m.start_date) }} ➝ {{ formatDate(m.end_date) }}
              </td>

              <td class="py-3 px-4 text-center">
                <span
                  class="px-2 py-1 rounded-full text-xs font-bold shadow-sm border"
                  :class="{
                    'bg-green-100 text-green-700 border-green-200': m.status === 'active',
                    'bg-red-100 text-red-700 border-red-200': m.status === 'expired',
                    'bg-yellow-100 text-yellow-700 border-yellow-200':
                      m.status === 'inactive_unpaid',
                    'bg-gray-100 text-gray-600': m.status === 'cancelled',
                  }"
                >
                  {{ traducirEstado(m.status) }}
                </span>
              </td>
              <td class="py-3 px-4 text-right font-mono font-bold">
                {{ formatCurrency(m.outstanding_balance) }}
              </td>
              <td class="py-3 px-4 text-center">
                <div class="flex gap-2 justify-center">
                  <!-- Solo mostrar Renovar si está Vencida -->
                  <button
                    v-if="m.status === 'expired'"
                    @click="abrirRenovacion(m)"
                    class="btn btn-sm bg-orange-500 hover:bg-orange-600 text-white shadow-sm flex items-center gap-1"
                    title="Renovar Membresía"
                  >
                    <span>🔄</span> Renovar
                  </button>

                  <!-- Mostrar Editar solo si NO está vencida (activa, pendiente, etc.) -->
                  <button
                    v-else
                    class="btn btn-sm bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 border border-gray-200 flex items-center gap-1"
                    @click="abrirEditarModal(m)"
                    title="Editar / Corregir"
                  >
                    <span>✏️</span> Editar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="showEditModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      >
        <div class="bg-white text-gray-800 w-full max-w-sm p-6 rounded-xl shadow-2xl">
          <h2 class="font-bold text-lg mb-4 border-b pb-2">Editar Membresía</h2>
          <form @submit.prevent="guardarCambios" class="space-y-3">
            <div>
              <label class="text-xs font-bold uppercase text-gray-500">Plan</label>
              <select v-model="editarMembresia.plan.id" class="w-full border p-2 rounded-lg">
                <option v-for="plan in planes" :key="plan.id" :value="plan.id">
                  {{ plan.membership_type?.name }} ({{ traducirFrecuencia(plan.frequency) }})
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs font-bold uppercase text-gray-500">Inicio</label>
                <input
                  v-model="editarMembresia.start_date"
                  type="date"
                  class="w-full border p-2 rounded-lg"
                />
              </div>
              <div>
                <label class="text-xs font-bold uppercase text-gray-500">Fin</label>
                <input
                  v-model="editarMembresia.end_date"
                  type="date"
                  class="w-full border p-2 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label class="text-xs font-bold uppercase text-gray-500">Estado</label>
              <select v-model="editarMembresia.status" class="w-full border p-2 rounded-lg">
                <option value="active">Activa</option>
                <option value="expired">Vencida</option>
                <option value="inactive_unpaid">Por Pagar</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>

            <div class="flex justify-end gap-2 mt-4 pt-2 border-t">
              <button type="button" @click="cerrarEditarModal" class="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">Guardar</button>
            </div>
          </form>
        </div>
      </div>

      <div
        v-if="showModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      >
        <div class="bg-white text-gray-800 w-full max-w-md p-6 rounded-xl shadow-2xl">
          <h2 class="font-bold text-lg mb-4 border-b pb-2">
            {{ form.member_id ? "Asignar membresía a " + busqueda : "Asignar Nueva" }}
          </h2>
          <form @submit.prevent="asignarMembresia" class="space-y-4">
            <!-- Solo mostrar búsqueda si NO hay member_id pre-seleccionado -->
            <div v-if="!form.member_id">
              <label class="text-xs font-bold uppercase text-gray-500">Buscar Cliente</label>
              <input
                v-model="busqueda"
                type="text"
                placeholder="Nombre..."
                class="w-full border p-2 rounded-lg"
              />
              <ul
                v-if="miembrosFiltrados.length"
                class="border rounded-lg mt-1 max-h-32 overflow-y-auto bg-gray-50 absolute w-64 z-10 shadow-lg"
              >
                <li
                  v-for="m in miembrosFiltrados"
                  :key="m.id"
                  @click="seleccionarMiembro(m)"
                  class="p-2 hover:bg-blue-100 cursor-pointer text-sm border-b"
                >
                  {{ m.name }}
                </li>
              </ul>
            </div>

            <div>
              <label class="text-xs font-bold uppercase text-gray-500">Plan</label>
              <select v-model="form.plan_id" class="w-full border p-2 rounded-lg" required>
                <option disabled value="">Seleccione...</option>
                <option v-for="p in planes" :key="p.id" :value="p.id">
                  {{ p.membership_type?.name }} - {{ traducirFrecuencia(p.frequency) }} - ${{
                    parseInt(p.price).toLocaleString()
                  }}
                </option>
              </select>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button type="button" @click="cerrarModal" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-success">Asignar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import api from "@/axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
const route = useRoute();

// Estado
const membresias = ref([]);
const miembros = ref([]);
const planes = ref([]);
const showModal = ref(false);
const showEditModal = ref(false);
const editarMembresia = ref({});
const busquedaMembresia = ref("");
const loading = ref(true);
const statusFilter = ref("");
const tituloFiltro = ref("Activas y Vencidas");
const form = ref({ member_id: "", plan_id: "", end_date: "", status: "inactive_unpaid" });
const busqueda = ref("");
const miembroSeleccionado = ref(false);

// Computed
const membresiasFiltradas = computed(() => {
  const term = busquedaMembresia.value.toLowerCase();
  return term
    ? membresias.value.filter((m) => m.member?.name?.toLowerCase().includes(term))
    : membresias.value;
});

const miembrosFiltrados = computed(() => {
  const term = busqueda.value.toLowerCase();
  return term
    ? miembros.value.filter(
        (m) => m.name.toLowerCase().includes(term) || (m.email || "").toLowerCase().includes(term),
      )
    : [];
});

// Cargas de Datos
const cargarMembresias = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (statusFilter.value) params.append("status", statusFilter.value);
    const { data } = await api.get(`/memberships?${params.toString()}`);
    membresias.value = data;
  } catch (error) {
    console.error(error);
    membresias.value = [];
  } finally {
    loading.value = false;
  }
};

const cargarMiembros = async () => {
  const { data } = await api.get("/members");
  miembros.value = data;
};
const cargarPlanes = async () => {
  try {
    const { data } = await api.get("/membershipPlan");

    // Mapa de traducción
    const traduccion = {
      daily: "Diario",
      weekly: "Semanal",
      biweekly: "Quincenal",
      monthly: "Mensual",
    };

    planes.value = data.map((plan) => ({
      ...plan,
      // Creamos el nombre compuesto EN ESPAÑOL
      name: `${plan.membership_type?.name || "Plan"} - ${traduccion[plan.frequency] || plan.frequency} ($${parseInt(plan.price).toLocaleString()})`,
    }));
  } catch (e) {
    console.error(e);
  }
};

// Acciones Filtro
const filtrarMembresias = (status) => {
  statusFilter.value = status;
  if (status === "active") tituloFiltro.value = "Solo Activas";
  else if (status === "inactive_unpaid") tituloFiltro.value = "Por Pagar";
  else if (status === "expiring_soon") tituloFiltro.value = "Vencen Pronto";
  else tituloFiltro.value = "Todas";
  cargarMembresias();
};

// Acciones Modales
const seleccionarMiembro = (miembro) => {
  form.value.member_id = miembro.id;
  busqueda.value = miembro.name;
  // Ocultar resultados al seleccionar
  miembroSeleccionado.value = true;
};
const cerrarModal = () => {
  showModal.value = false;
  busqueda.value = "";
  form.value = { member_id: "", plan_id: "", status: "inactive_unpaid" }; // Cambiado de "active" a "inactive_unpaid"
  miembroSeleccionado.value = false;
};

const asignarMembresia = async () => {
  try {
    // ELIMINADO: Ya no validamos aquí, dejamos que el Backend decida.
    // El backend ya tiene logic para devolver error si hay activa/pending
    // y para borrar si hay expired.

    await api.post("/memberships", {
      member_id: form.value.member_id,
      plan_id: form.value.plan_id,
    });
    cerrarModal();
    filtrarMembresias("inactive_unpaid");
    alert("Membresía asignada correctamente.");
  } catch (error) {
    console.error(error);
    const msg = error.response?.data?.error || "Error al asignar membresía";
    alert(msg);
  }
};

const abrirRenovacion = (m) => {
  // Usamos la misma lógica que "seleccionarMiembro" pero pre-llenamos desde la fila
  if (m.member) {
    seleccionarMiembro(m.member);
    showModal.value = true;
    miembroSeleccionado.value = true;
  }
};

const abrirEditarModal = (m) => {
  editarMembresia.value = {
    ...m,
    start_date: dayjs(m.start_date).format("YYYY-MM-DD"),
    end_date: dayjs(m.end_date).format("YYYY-MM-DD"),
    plan: { id: m.plan?.id },
  };
  showEditModal.value = true;
};

const cerrarEditarModal = () => {
  showEditModal.value = false;
  editarMembresia.value = {};
};

const guardarCambios = async () => {
  try {
    await api.put(`/memberships/${editarMembresia.value.id}`, {
      plan_id: editarMembresia.value.plan?.id,
      start_date: editarMembresia.value.start_date,
      end_date: editarMembresia.value.end_date,
      status: editarMembresia.value.status,
    });
    showEditModal.value = false;
    await cargarMembresias();
    alert("Actualizado");
  } catch (e) {
    alert("Error al guardar");
  }
};

// Utilidades
const formatDate = (d) => dayjs(d).format("DD/MM/YY");
const formatCurrency = (v) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(v);

const traducirFrecuencia = (f) => {
  const map = { daily: "Diaria", weekly: "Semanal", biweekly: "Quincenal", monthly: "Mensual" };
  return map[f] || f;
};

const traducirEstado = (s) => {
  const map = {
    active: "Activa",
    expired: "Vencida",
    inactive_unpaid: "Por Pagar",
    cancelled: "Cancelada",
  };
  return map[s] || s;
};

// On Mounted
onMounted(() => {
  if (route.query.filter) filtrarMembresias(route.query.filter);
  else cargarMembresias();
  cargarMiembros();
  cargarPlanes();
});
</script>
