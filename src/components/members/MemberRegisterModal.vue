<template>
  <Transition name="modal-fade">
    <div v-if="show" class="register-overlay" @click.self="$emit('close')">
      <div class="register-panel">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100">
          <div class="flex items-center gap-4">
            <div>
              <h1 class="text-xl font-bold text-gray-900 tracking-tight leading-tight">
                Registrar Nuevo Cliente
              </h1>
              <p class="text-xs text-gray-500 mt-0.5">
                Complete los detalles para dar de alta un nuevo miembro.
              </p>
            </div>
          </div>
          <button
            type="button"
            class="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar"
            @click="$emit('close')"
          >
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body scrollable -->
        <div class="flex-1 overflow-y-auto px-6 sm:px-8 py-7">
          <form id="register-form" class="space-y-8" @submit.prevent="registrar">
            <!-- ===== Información personal ===== -->
            <section>
              <div class="section-header">
                <span class="section-bar bg-primary-600" />
                <h2 class="section-title text-primary-700">Información Personal</h2>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <BaseInput
                  v-model="form.name"
                  label="Nombre Completo"
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  required
                />
                <BaseInput
                  v-model="form.identification"
                  label="Cédula / ID"
                  type="text"
                  placeholder="12345678"
                  required
                />
                <BaseInput
                  v-model="form.email"
                  label="Email"
                  type="email"
                  placeholder="juan@ejemplo.com"
                />
                <BaseInput
                  v-model="form.phone"
                  label="Teléfono"
                  type="tel"
                  placeholder="+57 300 123 4567"
                />
                <BaseInput
                  v-model="form.birth_date"
                  label="Fecha de Nacimiento"
                  type="date"
                />
                <BaseSelect
                  v-model="form.sexo"
                  label="Sexo"
                  :options="sexoOptions"
                />
              </div>
            </section>

            <!-- ===== Biometría ===== -->
            <section class="p-5 sm:p-6 bg-gray-50 rounded-xl border border-gray-100">
              <div class="section-header">
                <span class="section-bar bg-success-600" />
                <h2 class="section-title text-success-700">Biometría</h2>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <BaseInput
                  v-model.number="form.estatura"
                  label="Estatura"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="1.70"
                >
                  <template #suffix>
                    <span class="text-xs font-semibold text-success-700">m</span>
                  </template>
                </BaseInput>

                <BaseInput
                  v-model.number="form.peso"
                  label="Peso"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="70.5"
                >
                  <template #suffix>
                    <span class="text-xs font-semibold text-success-700">kg</span>
                  </template>
                </BaseInput>
              </div>
            </section>

            <!-- ===== Antecedentes médicos ===== -->
            <section>
              <div class="section-header">
                <span class="section-bar bg-danger-500" />
                <h2 class="section-title text-danger-600">Antecedentes Médicos</h2>
                <span class="ml-auto optional-tag">Opcional</span>
              </div>
              <textarea
                v-model="form.medical_history"
                rows="3"
                class="field-input resize-none"
                placeholder="Detalle alergias, lesiones previas o condiciones crónicas relevantes..."
              />
            </section>

            <!-- ===== Plan inicial ===== -->
            <section v-if="planes && planes.length" class="pt-6 border-t border-gray-100">
              <BaseSelect
                v-model="form.plan_id"
                label="Asignar Plan Inicial"
                hint="Se creará la membresía pendiente de pago."
                :options="planOptions"
              />
            </section>

            <!-- ===== Huella dactilar ===== -->
            <section class="pt-6 border-t border-gray-100">
              <div class="section-header">
                <span class="section-bar bg-primary-600" />
                <h2 class="section-title text-primary-700">Huella Dactilar</h2>
                <span class="ml-auto optional-tag">Opcional</span>
              </div>
              <div class="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-4">
                <FingerprintEnroll
                  :member-id="null"
                  :has-fingerprint="false"
                  @captured="(t) => (capturedTemplate = t)"
                />
                <p
                  v-if="capturedTemplate"
                  class="mt-3 text-xs font-semibold text-success-700"
                >
                  Huella capturada — se guardará al registrar
                </p>
              </div>
            </section>
          </form>
        </div>

        <!-- Footer -->
        <div
          class="px-6 sm:px-8 py-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3"
        >
          <BaseButton variant="secondary" @click="$emit('close')">
            Cancelar
          </BaseButton>
          <BaseButton
            type="submit"
            form="register-form"
            variant="primary"
            size="lg"
            :loading="loading"
            :disabled="loading"
          >
            Guardar Cliente
          </BaseButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import api from "@/axios";
import Swal from "sweetalert2";
import FingerprintEnroll from "@/components/FingerprintEnroll.vue";
import { BaseInput, BaseSelect, BaseButton } from "@/components/ui";
import { SWAL_COLORS } from "@/lib/colors";

const props = defineProps({
  show: Boolean,
  planes: Array,
});

const emit = defineEmits(["close", "saved"]);

const loading = ref(false);
const capturedTemplate = ref("");

const sexoOptions = [
  { value: "masculino", label: "Masculino" },
  { value: "femenino", label: "Femenino" },
  { value: "no binario", label: "No binario" },
  { value: "otro", label: "Otro" },
];

const planOptions = computed(() => [
  { value: "", label: "— Solo registrar cliente —" },
  ...(props.planes || []).map((p) => ({ value: p.id, label: p.name })),
]);

const form = reactive({
  name: "",
  identification: "",
  email: "",
  phone: "",
  birth_date: "",
  medical_history: "",
  sexo: "masculino",
  peso: null,
  estatura: null,
  plan_id: "",
});

function resetForm() {
  Object.assign(form, {
    name: "",
    identification: "",
    email: "",
    phone: "",
    birth_date: "",
    medical_history: "",
    sexo: "masculino",
    peso: null,
    estatura: null,
    plan_id: "",
  });
  capturedTemplate.value = "";
}

const registrar = async () => {
  loading.value = true;
  try {
    const { data: nuevoCliente } = await api.post("/members", form);

    if (capturedTemplate.value) {
      await api.post(`/members/${nuevoCliente.id}/fingerprint`, {
        fingerprint_data: capturedTemplate.value,
      });
    }

    emit("saved", { client: nuevoCliente, hasPlan: !!form.plan_id });
    resetForm();
  } catch (e) {
    console.error(e);
    if (e.response?.status === 422) {
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: "Verifica si la identificación o email ya existen.",
        confirmButtonColor: SWAL_COLORS.danger,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo registrar el cliente.",
        confirmButtonColor: SWAL_COLORS.danger,
      });
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* ===== Overlay ===== */
.register-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(17, 24, 39, 0.5);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  overflow-y: auto;
}

/* ===== Panel ===== */
.register-panel {
  position: relative;
  width: 100%;
  max-width: 64rem;
  max-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid rgb(243 244 246);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
              0 10px 20px -5px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* ===== Transición ===== */
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-active .register-panel,
.modal-fade-leave-active .register-panel {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .register-panel,
.modal-fade-leave-to .register-panel {
  transform: translateY(8px) scale(0.98);
  opacity: 0;
}

/* ===== Section header ===== */
.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.section-bar {
  display: block;
  width: 4px;
  height: 1.25rem;
  border-radius: 9999px;
}
.section-title {
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.optional-tag {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: rgb(156 163 175);
}
</style>
