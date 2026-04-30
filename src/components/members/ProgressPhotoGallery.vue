<template>
  <div>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      <div
        v-for="(photo, i) in photos"
        :key="i"
        class="photo-frame"
      >
        <img :src="photo.photo" :alt="`Progreso ${i + 1}`" class="photo-img" />
        <span class="photo-tag">#{{ i + 1 }}</span>
        <span v-if="photo.taken_at" class="photo-date">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ formatDate(photo.taken_at) }}
        </span>
        <button
          v-if="!readonly"
          type="button"
          class="photo-remove"
          aria-label="Quitar foto"
          @click="removePhoto(i)"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="!readonly" class="add-slot">
        <div class="add-actions">
          <button type="button" class="photo-btn photo-btn-primary" @click="openCamera">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Cámara
          </button>
          <button type="button" class="photo-btn photo-btn-secondary" @click="triggerFileInput">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Subir
          </button>
        </div>
        <input
          ref="fileInputEl"
          type="file"
          accept="image/*"
          class="hidden"
          @change="onFileSelected"
        />
        <p class="add-hint">Agregar foto de progreso</p>
      </div>
    </div>

    <p v-if="photos.length === 0 && readonly" class="text-sm italic text-subtle text-center py-4">
      No hay fotos de progreso registradas.
    </p>

    <!-- Camera modal -->
    <Transition name="cam-fade">
      <div v-if="cameraOpen" class="cam-overlay" @click.self="closeCamera">
        <div class="cam-panel">
          <div class="cam-header">
            <h3 class="text-sm font-bold text-default">Tomar foto de progreso</h3>
            <button type="button" class="cam-close" aria-label="Cerrar" @click="closeCamera">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="cam-body">
            <div v-if="cameraError" class="cam-error">
              <svg class="w-8 h-8 mb-2 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p class="text-sm text-default text-center">{{ cameraError }}</p>
            </div>
            <video v-show="!cameraError" ref="videoEl" class="cam-video" autoplay playsinline muted />
          </div>
          <div class="cam-footer">
            <button type="button" class="photo-btn photo-btn-secondary" @click="closeCamera">
              Cancelar
            </button>
            <button
              type="button"
              class="photo-btn photo-btn-capture"
              :disabled="!!cameraError"
              @click="capturePhoto"
            >
              Capturar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onBeforeUnmount } from "vue";

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  readonly: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue"]);

function normalizeEntry(value) {
  if (!value) return null;
  if (typeof value === "string") return { photo: value, taken_at: null };
  if (typeof value === "object" && value.photo) {
    return { photo: value.photo, taken_at: value.taken_at || null };
  }
  return null;
}

const photos = computed(() => {
  return (props.modelValue || []).map(normalizeEntry).filter(Boolean);
});

function addPhoto(dataUrl) {
  const next = [...photos.value, { photo: dataUrl, taken_at: new Date().toISOString() }];
  emit("update:modelValue", next);
}

function removePhoto(index) {
  const next = photos.value.filter((_, i) => i !== index);
  emit("update:modelValue", next);
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

// File upload
const fileInputEl = ref(null);
function triggerFileInput() {
  fileInputEl.value?.click();
}
function onFileSelected(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) addPhoto(e.target.result);
  };
  reader.readAsDataURL(file);
  event.target.value = "";
}

// Camera
const cameraOpen = ref(false);
const cameraError = ref("");
const videoEl = ref(null);
let activeStream = null;

async function openCamera() {
  cameraOpen.value = true;
  cameraError.value = "";
  await nextTick();

  if (!navigator.mediaDevices?.getUserMedia) {
    cameraError.value = "Tu navegador no soporta acceso a la cámara.";
    return;
  }

  try {
    activeStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    });
    if (videoEl.value) {
      videoEl.value.srcObject = activeStream;
      await videoEl.value.play().catch(() => {});
    }
  } catch (err) {
    cameraError.value =
      err?.name === "NotAllowedError"
        ? "Permiso de cámara denegado. Habilítalo en el navegador."
        : "No se pudo acceder a la cámara: " + (err?.message || "error desconocido");
  }
}

function stopStream() {
  if (activeStream) {
    activeStream.getTracks().forEach((t) => t.stop());
    activeStream = null;
  }
  if (videoEl.value) videoEl.value.srcObject = null;
}

function closeCamera() {
  stopStream();
  cameraOpen.value = false;
  cameraError.value = "";
}

function capturePhoto() {
  if (!videoEl.value || cameraError.value) return;
  const v = videoEl.value;
  const canvas = document.createElement("canvas");
  canvas.width = v.videoWidth || 640;
  canvas.height = v.videoHeight || 480;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
  addPhoto(canvas.toDataURL("image/jpeg", 0.85));
  closeCamera();
}

onBeforeUnmount(stopStream);
</script>

<style scoped>
.photo-frame {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: 0.75rem;
  overflow: hidden;
  background: var(--color-surface-soft);
  border: 1px solid var(--color-border);
}
:global(.dark) .photo-frame {
  background: var(--color-overlay);
  border-color: rgba(255, 255, 255, 0.12);
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-tag {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: white;
  background: rgba(0, 0, 0, 0.55);
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  backdrop-filter: blur(4px);
}

.photo-date {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  right: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: 0.625rem;
  font-weight: 600;
  color: white;
  background: rgba(0, 0, 0, 0.6);
  padding: 0.2rem 0.4rem;
  border-radius: 9999px;
  backdrop-filter: blur(4px);
}

.photo-remove {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 9999px;
  background: rgba(220, 38, 38, 0.9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: transform 0.15s;
}
.photo-remove:hover {
  transform: scale(1.08);
}

.add-slot {
  aspect-ratio: 4 / 3;
  border-radius: 0.75rem;
  border: 2px dashed var(--color-border-strong);
  background: var(--color-surface-soft);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  gap: 0.5rem;
  transition: all 0.15s ease;
}
.add-slot:hover {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.05);
}
:global(.dark) .add-slot {
  background: var(--color-overlay);
  border-color: rgba(255, 255, 255, 0.18);
}

.add-actions {
  display: flex;
  gap: 0.4rem;
  width: 100%;
}

.add-hint {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-subtle);
  text-align: center;
}

.photo-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.4rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.65rem;
  font-weight: 700;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
}

.photo-btn-primary {
  background: rgba(99, 102, 241, 0.1);
  color: #4f46e5;
  border-color: rgba(99, 102, 241, 0.25);
}
.photo-btn-primary:hover { background: rgba(99, 102, 241, 0.18); }
:global(.dark) .photo-btn-primary {
  background: rgba(99, 102, 241, 0.18);
  color: #a5b4fc;
}

.photo-btn-secondary {
  background: var(--color-surface);
  color: var(--color-text-muted);
  border-color: var(--color-border);
}
.photo-btn-secondary:hover {
  background: var(--color-overlay);
  color: var(--color-text);
}

.photo-btn-capture {
  background: #4f46e5;
  color: white;
  padding: 0.55rem 1.2rem;
  font-size: 0.85rem;
}
.photo-btn-capture:hover:not(:disabled) { background: #4338ca; }
.photo-btn-capture:disabled { opacity: 0.5; cursor: not-allowed; }

/* Camera overlay */
.cam-overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.cam-panel {
  width: 100%;
  max-width: 36rem;
  background: var(--modal-panel-bg);
  border: 1px solid var(--modal-panel-border);
  border-radius: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.cam-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

.cam-close {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.375rem;
}
.cam-close:hover {
  background: var(--color-overlay);
  color: var(--color-text);
}

.cam-body {
  position: relative;
  background: black;
  aspect-ratio: 4 / 3;
}

.cam-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

.cam-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: var(--color-surface);
  color: var(--color-text);
}

.cam-footer {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-soft);
}
.cam-footer .photo-btn { flex: 1; }

.cam-fade-enter-active,
.cam-fade-leave-active { transition: opacity 0.2s ease; }
.cam-fade-enter-from,
.cam-fade-leave-to { opacity: 0; }
</style>
