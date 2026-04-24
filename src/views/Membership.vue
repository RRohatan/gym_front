<template>
  <div class="page-layout">
    <BaseCard title="Membresías" :subtitle="tituloFiltro" class="space-y-6">
      <template #actions>
        <router-link to="/Menu" class="btn btn-secondary flex-1 sm:flex-none">
          Inicio
        </router-link>
        <BaseButton variant="success" class="flex-1 sm:flex-none" @click="showModal = true">
          Asignar membresía
        </BaseButton>
      </template>

      <div class="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
        <BaseButton
          v-for="f in filtros"
          :key="f.value"
          size="sm"
          :variant="statusFilter === f.value ? 'primary' : 'secondary'"
          class="whitespace-nowrap"
          @click="filtrarMembresias(f.value)"
        >
          {{ f.label }}
        </BaseButton>
      </div>

      <BaseInput v-model="busquedaMembresia" placeholder="Buscar miembro..." />

      <div class="table-wrap">
        <div v-if="loading" class="text-center py-10 text-gray-400">Cargando...</div>

        <table v-else class="w-full text-sm min-w-[800px]">
          <thead class="table-head">
            <tr>
              <th>Cliente</th>
              <th>Plan</th>
              <th>Vigencia</th>
              <th class="!text-center">Estado</th>
              <th class="!text-right">Saldo</th>
              <th class="!text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="membresias.length === 0">
              <td colspan="6" class="py-10 text-center text-gray-400">
                No se encontraron resultados.
              </td>
            </tr>
            <tr v-for="m in membresias" :key="m.id" class="table-row">
              <td class="font-semibold text-gray-700">{{ m.member?.name }}</td>
              <td>
                {{ m.plan?.membership_type?.name }}
                <BaseBadge color="gray" class="ml-1">
                  {{ traducirFrecuencia(m.plan?.frequency) }}
                </BaseBadge>
              </td>
              <td class="text-xs text-gray-500">
                {{ formatDate(m.start_date) }} <i class="bi bi-arrow-right"></i> {{ formatDate(m.end_date) }}
              </td>
              <td class="text-center">
                <BaseBadge :color="statusColor(m.status)">
                  {{ traducirEstado(m.status) }}
                </BaseBadge>
              </td>
              <td class="text-right font-mono font-semibold">
                {{ formatCurrency(m.outstanding_balance) }}
              </td>
              <td class="text-center">
                <div class="flex gap-2 justify-center">
                  <BaseButton
                    v-if="m.status === 'expired'"
                    variant="orange"
                    size="sm"
                    title="Renovar Membresía"
                    @click="abrirRenovacion(m)"
                  >
                    <i class="bi bi-arrow-clockwise"></i> Renovar
                  </BaseButton>
                  <BaseButton
                    v-else
                    variant="secondary"
                    size="sm"
                    title="Editar / Corregir"
                    @click="abrirEditarModal(m)"
                  >
                    <i class="bi bi-pencil"></i> Editar
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="lastPage > 1"
        class="flex items-center justify-between text-sm text-gray-600"
      >
        <span>
          Página {{ currentPage }} de {{ lastPage }} ({{ totalItems }} registros)
        </span>
        <div class="flex gap-1">
          <BaseButton
            variant="secondary"
            size="sm"
            :disabled="currentPage === 1"
            @click="cambiarPagina(currentPage - 1)"
          >
            <i class="bi bi-arrow-left"></i> Anterior
          </BaseButton>
          <BaseButton
            v-for="page in paginasVisibles"
            :key="page"
            :variant="page === currentPage ? 'primary' : 'secondary'"
            size="sm"
            @click="cambiarPagina(page)"
          >
            {{ page }}
          </BaseButton>
          <BaseButton
            variant="secondary"
            size="sm"
            :disabled="currentPage === lastPage"
            @click="cambiarPagina(currentPage + 1)"
          >
            Siguiente <i class="bi bi-arrow-right"></i>
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <BaseModal
      v-model="showEditModal"
      title="Editar Membresía"
      size="sm"
      @close="cerrarEditarModal"
    >
      <form id="edit-membership-form" class="space-y-3" @submit.prevent="guardarCambios">
        <BaseSelect
          v-model="editarMembresia.plan.id"
          label="Plan"
          :options="
            planes.map((p) => ({
              value: p.id,
              label: `${p.membership_type?.name} (${traducirFrecuencia(p.frequency)})`,
            }))
          "
        />

        <div class="grid grid-cols-2 gap-3">
          <BaseInput
            v-model="editarMembresia.start_date"
            label="Inicio"
            type="date"
          />
          <BaseInput
            v-model="editarMembresia.end_date"
            label="Fin"
            type="date"
          />
        </div>

        <BaseSelect
          v-model="editarMembresia.status"
          label="Estado"
          :options="STATUS_OPTIONS"
        />
      </form>

      <template #footer>
        <BaseButton variant="secondary" @click="cerrarEditarModal">Cancelar</BaseButton>
        <BaseButton variant="primary" type="submit" form="edit-membership-form">
          Guardar
        </BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="showModal"
      :title="form.member_id ? `Asignar membresía a ${busqueda}` : 'Asignar Nueva'"
      size="md"
      @close="cerrarModal"
    >
      <form id="assign-membership-form" class="space-y-4" @submit.prevent="asignarMembresia">
        <div v-if="!form.member_id" class="relative">
          <BaseInput
            v-model="busqueda"
            label="Buscar Cliente"
            placeholder="Nombre..."
          />
          <ul
            v-if="miembrosFiltrados.length"
            class="border border-gray-200 rounded-lg mt-1 max-h-32 overflow-y-auto bg-white absolute left-0 right-0 z-10 shadow-lg"
          >
            <li
              v-for="m in miembrosFiltrados"
              :key="m.id"
              class="p-2 hover:bg-blue-100 cursor-pointer text-sm border-b last:border-0"
              @click="seleccionarMiembro(m)"
            >
              {{ m.name }}
            </li>
          </ul>
        </div>

        <BaseSelect
          v-model="form.plan_id"
          label="Plan"
          placeholder="Seleccione..."
          :options="
            planes.map((p) => ({
              value: p.id,
              label: `${p.membership_type?.name} - ${traducirFrecuencia(p.frequency)} - $${parseInt(p.price).toLocaleString()}`,
            }))
          "
          required
        />
      </form>

      <template #footer>
        <BaseButton variant="secondary" @click="cerrarModal">Cancelar</BaseButton>
        <BaseButton variant="success" type="submit" form="assign-membership-form">
          Asignar
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import api from "@/axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
import Swal from "sweetalert2";
import { BaseButton, BaseInput, BaseSelect, BaseCard, BaseBadge, BaseModal } from "@/components/ui";

const route = useRoute();

// Filtros y mapeo de color para badges de estado.
const filtros = [
  { value: "", label: "Todos" },
  { value: "active", label: "Activas" },
  { value: "inactive_unpaid", label: "Por Pagar" },
  { value: "expiring_soon", label: "Vencen Pronto" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Activa" },
  { value: "expired", label: "Vencida" },
  { value: "inactive_unpaid", label: "Por Pagar" },
  { value: "cancelled", label: "Cancelada" },
];

const statusColor = (status) => {
  const map = {
    active: "green",
    expired: "red",
    inactive_unpaid: "yellow",
    cancelled: "gray",
    inactive: "gray",
  };
  return map[status] || "gray";
};

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

// Paginación
const currentPage = ref(1);
const lastPage = ref(1);
const totalItems = ref(0);

const paginasVisibles = computed(() => {
  const delta = 2;
  const pages = [];
  for (let i = Math.max(1, currentPage.value - delta); i <= Math.min(lastPage.value, currentPage.value + delta); i++) {
    pages.push(i);
  }
  return pages;
});

// Búsqueda en modal de asignar (solo local)
const miembrosFiltrados = computed(() => {
  const term = busqueda.value.toLowerCase();
  return term
    ? miembros.value.filter(
        (m) => m.name.toLowerCase().includes(term) || (m.email || "").toLowerCase().includes(term),
      )
    : [];
});

// Watcher para búsqueda server-side con debounce
let searchTimeout = null;
watch(busquedaMembresia, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    cargarMembresias();
  }, 350);
});

// Cargas de Datos
const cargarMembresias = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (statusFilter.value) params.append("status", statusFilter.value);
    if (busquedaMembresia.value) params.append("search", busquedaMembresia.value);
    params.append("page", currentPage.value);
    const { data } = await api.get(`/memberships?${params.toString()}`);
    // El backend devuelve estructura paginada {data, current_page, last_page, total}
    // para algunos filtros, pero para otros (ej. "active", "expiring_soon")
    // regresa un array plano. Toleramos ambos casos.
    if (Array.isArray(data)) {
      membresias.value = data;
      currentPage.value = 1;
      lastPage.value = 1;
      totalItems.value = data.length;
    } else {
      membresias.value = Array.isArray(data?.data) ? data.data : [];
      currentPage.value = data?.current_page ?? 1;
      lastPage.value = data?.last_page ?? 1;
      totalItems.value = data?.total ?? membresias.value.length;
    }
  } catch (error) {
    console.error(error);
    membresias.value = [];
  } finally {
    loading.value = false;
  }
};

const cambiarPagina = (page) => {
  if (page < 1 || page > lastPage.value) return;
  currentPage.value = page;
  cargarMembresias();
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
  currentPage.value = 1;
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
    Swal.fire({
      icon: "success",
      title: "Éxito",
      text: "Membresía asignada correctamente.",
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error(error);
    const msg = error.response?.data?.error || "Error al asignar membresía";
    Swal.fire({
      icon: "error",
      title: "Error",
      text: msg,
    });
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
    Swal.fire({
      icon: "success",
      title: "Actualizado",
      text: "La membresía ha sido actualizada correctamente.",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (e) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Hubo un error al guardar los cambios.",
    });
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
    inactive: "Inactiva",
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
