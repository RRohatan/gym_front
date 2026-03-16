import { ref, onUnmounted } from 'vue'

// Fingerprint.WebApi es global, inyectado por fingerprint.sdk.min.js
declare const Fingerprint: any

export type FingerprintEvent =
  | { event: 'status';     message: string }
  | { event: 'progress';   stage: number; total: number }
  | { event: 'enrolled';   success: boolean; message: string }
  | { event: 'captured';   success: boolean; template?: string; message?: string }
  | { event: 'identified'; success: boolean; message: string; member?: any }
  | { event: 'error';      message: string }

type ActionMode = 'capture' | 'enroll' | 'identify' | null

export function useFingerprint() {
  const connected  = ref(false)
  const busy       = ref(false)
  const statusMsg  = ref('')
  const lastEvent  = ref<FingerprintEvent | null>(null)

  let sdk: any = null
  let resolveAction: ((e: FingerprintEvent) => void) | null = null
  let mode: ActionMode = null

  // Acumulador de muestras para enroll (necesita 4)
  let samples: string[] = []
  let enrollTarget: { memberId: number; apiUrl: string; token: string } | null = null
  let identifyCandidates: Array<{ id: string; template: string; member: any }> = []
  let identifyApiUrl = ''

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function setStatus(message: string) {
    statusMsg.value = message
    lastEvent.value = { event: 'status', message }
  }

  function emitAndResolve(ev: FingerprintEvent) {
    lastEvent.value = ev
    busy.value = false
    mode = null
    samples = []
    sdk?.stopAcquisition()
    resolveAction?.(ev)
    resolveAction = null
  }

  // ─── Inicializar SDK ──────────────────────────────────────────────────────

  function createSdk() {
    if (sdk) return

    sdk = new Fingerprint.WebApi()

    sdk.onDeviceConnected = () => { connected.value = true }
    sdk.onDeviceDisconnected = () => { connected.value = false }

    sdk.onCommunicationFailed = () => {
      emitAndResolve({ event: 'error', message: 'Error de comunicación con el lector. ¿Está DpHostW.exe corriendo?' })
    }

    sdk.onSamplesAcquired = async (evt: any) => {
      try {
        const parsed = JSON.parse(evt.samples)
        // Raw format: parsed[0].Data es base64url → decodificar a UTF8 → JSON con campos de imagen
        const outerB64  = Fingerprint.b64UrlTo64(parsed[0].Data)
        const innerJson = JSON.parse(Fingerprint.b64UrlToUtf8(outerB64))
        const sampleData: string = JSON.stringify({
          data:   Fingerprint.b64UrlTo64(innerJson.Data),
          width:  innerJson.Format.iWidth,
          height: innerJson.Format.iHeight,
          dpi:    innerJson.Format.iXdpi,
        })

        // ── CAPTURE (1 muestra) ──────────────────────────────────────────
        if (mode === 'capture') {
          emitAndResolve({ event: 'captured', success: true, template: sampleData })
          return
        }

        // ── ENROLL (acumular 4 muestras) ─────────────────────────────────
        if (mode === 'enroll') {
          samples.push(sampleData)
          const needed = 4 - samples.length

          if (needed > 0) {
            setStatus(`Muestra ${samples.length} de 4 — pon el dedo de nuevo`)
            lastEvent.value = { event: 'progress', stage: samples.length, total: 4 }
            return
          }

          // Tenemos 4 muestras — usamos la última como template final
          const template = samples[samples.length - 1]

          if (enrollTarget) {
            setStatus('Guardando huella...')
            const { memberId, apiUrl, token } = enrollTarget
            enrollTarget = null
            try {
              const resp = await fetch(`${apiUrl}/members/${memberId}/fingerprint`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                  'Accept': 'application/json',
                },
                body: JSON.stringify({ fingerprint_data: template }),
              })
              emitAndResolve(
                resp.ok
                  ? { event: 'enrolled', success: true,  message: 'Huella registrada correctamente' }
                  : { event: 'enrolled', success: false, message: 'Error al guardar la huella en el servidor' }
              )
            } catch {
              emitAndResolve({ event: 'enrolled', success: false, message: 'Error de conexión con el servidor' })
            }
          } else {
            // Modo captura-para-registro (sin memberId aún)
            emitAndResolve({ event: 'captured', success: true, template })
          }
          return
        }

        // ── IDENTIFY (1:N contra templates descargados) ───────────────────
        if (mode === 'identify') {
          setStatus('Verificando...')
          try {
            const resp = await fetch(`${identifyApiUrl}/access/fingerprint/match`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify({ sample: sampleData, candidates: identifyCandidates }),
            })
            const data = await resp.json()

            if (!resp.ok || !data.member_id) {
              emitAndResolve({ event: 'identified', success: false, message: 'Huella no reconocida' })
              return
            }

            const member = identifyCandidates.find(c => String(c.id) === String(data.member_id))?.member
            emitAndResolve({ event: 'identified', success: true, message: data.message ?? 'Acceso permitido', member })
          } catch (e: any) {
            emitAndResolve({ event: 'error', message: e.message ?? 'Error al identificar' })
          }
        }
      } catch (e: any) {
        emitAndResolve({ event: 'error', message: e.message ?? 'Error procesando muestra' })
      }
    }
  }

  // ─── API pública ──────────────────────────────────────────────────────────

  function disconnect() {
    sdk?.stopAcquisition()
    sdk = null
    connected.value = false
  }

  async function capture(): Promise<FingerprintEvent> {
    createSdk()
    busy.value = true
    mode = 'capture'
    samples = []
    setStatus('Coloca tu dedo en el lector...')
    await sdk.startAcquisition(Fingerprint.SampleFormat.Raw)
    return new Promise(resolve => { resolveAction = resolve })
  }

  async function enroll(memberId: number, apiUrl: string, token: string): Promise<FingerprintEvent> {
    createSdk()
    busy.value = true
    mode = 'enroll'
    samples = []
    enrollTarget = { memberId, apiUrl, token }
    setStatus('Coloca tu dedo en el lector (4 veces)...')
    await sdk.startAcquisition(Fingerprint.SampleFormat.Raw)
    return new Promise(resolve => { resolveAction = resolve })
  }

  async function identify(gimnasioId: number, apiUrl: string): Promise<FingerprintEvent> {
    createSdk()
    busy.value = true
    setStatus('Cargando base de datos de huellas...')

    try {
      const resp = await fetch(`${apiUrl}/kiosk/fingerprints/${gimnasioId}`)
      const membersData: any[] = await resp.json()

      if (!membersData.length) {
        busy.value = false
        return { event: 'identified', success: false, message: 'No hay huellas registradas en este gimnasio' }
      }

      identifyCandidates = membersData.map(m => ({ id: String(m.id), template: m.fingerprint_data, member: m }))
      identifyApiUrl = apiUrl
    } catch {
      busy.value = false
      return { event: 'error', message: 'No se pudo cargar la base de datos de huellas' }
    }

    mode = 'identify'
    samples = []
    setStatus('Coloca tu dedo en el lector...')
    await sdk.startAcquisition(Fingerprint.SampleFormat.Raw)
    return new Promise(resolve => { resolveAction = resolve })
  }

  onUnmounted(disconnect)

  return { connected, busy, statusMsg, lastEvent, capture, enroll, identify, disconnect }
}
