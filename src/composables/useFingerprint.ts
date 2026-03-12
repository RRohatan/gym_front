import { ref, onUnmounted } from 'vue'

const BRIDGE_URL = 'ws://localhost:3001'

export type FingerprintEvent =
  | { event: 'status';     message: string }
  | { event: 'progress';   stage: number }
  | { event: 'enrolled';   success: boolean; message: string }
  | { event: 'captured';   success: boolean; template?: string; message?: string }
  | { event: 'identified'; success: boolean; message: string; member?: any }
  | { event: 'pong' }
  | { event: 'error';      message: string }

export function useFingerprint() {
  const connected  = ref(false)
  const busy       = ref(false)
  const statusMsg  = ref('')
  const lastEvent  = ref<FingerprintEvent | null>(null)

  let ws: WebSocket | null = null
  let resolveAction: ((e: FingerprintEvent) => void) | null = null

  function connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (ws && ws.readyState === WebSocket.OPEN) { resolve(); return }

      ws = new WebSocket(BRIDGE_URL)

      ws.onopen = () => {
        connected.value = true
        resolve()
      }

      ws.onerror = () => {
        connected.value = false
        reject(new Error('No se pudo conectar con el servicio de huella.\nAsegúrate de que fingerprint_bridge.py esté corriendo.'))
      }

      ws.onclose = () => {
        connected.value = false
      }

      ws.onmessage = (msg) => {
        const data: FingerprintEvent = JSON.parse(msg.data)
        lastEvent.value = data

        if (data.event === 'status' || data.event === 'progress') {
          statusMsg.value = data.event === 'status'
            ? data.message
            : `Capturando... (${(data as any).stage}/5)`
          return
        }

        // Evento final — resolver la promesa de la acción activa
        if (resolveAction) {
          resolveAction(data)
          resolveAction = null
          busy.value = false
        }
      }
    })
  }

  function disconnect() {
    ws?.close()
    ws = null
    connected.value = false
  }

  function _waitForResult(): Promise<FingerprintEvent> {
    return new Promise((resolve) => {
      resolveAction = resolve
    })
  }

  async function capture(): Promise<FingerprintEvent> {
    await connect()
    busy.value = true
    statusMsg.value = ''
    ws!.send(JSON.stringify({ action: 'capture' }))
    return _waitForResult()
  }

  async function enroll(memberId: number, apiUrl: string, token: string): Promise<FingerprintEvent> {
    await connect()
    busy.value = true
    statusMsg.value = ''
    ws!.send(JSON.stringify({ action: 'enroll', member_id: memberId, api_url: apiUrl, token }))
    return _waitForResult()
  }

  async function identify(gimnasioId: number, apiUrl: string): Promise<FingerprintEvent> {
    await connect()
    busy.value = true
    statusMsg.value = ''
    ws!.send(JSON.stringify({ action: 'identify', gimnasio_id: gimnasioId, api_url: apiUrl }))
    return _waitForResult()
  }

  onUnmounted(disconnect)

  return { connected, busy, statusMsg, lastEvent, capture, enroll, identify, connect, disconnect }
}
