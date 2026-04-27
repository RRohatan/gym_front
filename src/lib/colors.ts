/**
 * Paleta centralizada de colores del proyecto.
 *
 * Fuente única de verdad para hex CSS que NO pueden expresarse como clases
 * Tailwind (p.ej. configuración de librerías externas).
 *
 * Los tokens aquí deben mantenerse alineados con los definidos en
 * `tailwind.config.js → theme.extend.colors`.
 *
 * Uso recomendado:
 *
 *   // Para botones de SweetAlert (usan hex CSS, no clases):
 *   import { SWAL_COLORS } from '@/lib/colors'
 *   Swal.fire({ confirmButtonColor: SWAL_COLORS.danger })
 *
 *   // Para datasets de Chart.js:
 *   import { CHART_COLORS } from '@/lib/colors'
 *   backgroundColor: CHART_COLORS.palette
 *
 * Para markup: **NO uses este módulo en templates**. Usa clases Tailwind
 * (`bg-success-600`, `text-danger-500`, etc.) directamente.
 */

/** Colores base del sistema (alineados con tailwind.config.js). */
export const COLORS = {
  primary: '#2563eb',   // primary-600
  success: '#059669',   // success-600
  danger: '#dc2626',    // danger-600
  warning: '#f59e0b',   // warning-DEFAULT
  info: '#3085d6',      // azul informativo (SweetAlert-compatible)

  // Variantes específicas para charts (más saturadas para contraste en gráficos).
  chartGreen: '#16A34A',
  chartRed: '#DC2626',
  chartYellow: '#EAB308',
  chartBlue: '#2563EB',
  chartEmerald: '#10B981',
  chartAmber: '#F59E0B',
  chartRose: '#EF4444',
  chartSky: '#3B82F6',
  chartViolet: '#8B5CF6',
} as const

/**
 * Colores para botones de SweetAlert2 (prop `confirmButtonColor` /
 * `cancelButtonColor`). La librería solo acepta hex CSS; por eso no
 * podemos usar clases Tailwind aquí.
 */
export const SWAL_COLORS = {
  primary: COLORS.primary,
  danger: COLORS.danger,
  warning: COLORS.warning,
  info: COLORS.info,
  success: COLORS.success,
} as const

/**
 * Colores para datasets de Chart.js. Usa tonos saturados que se leen bien
 * en gráficos de pie/bar.
 */
export const CHART_COLORS = {
  active: COLORS.chartGreen,
  expired: COLORS.chartRed,
  pending: COLORS.chartYellow,
  income: COLORS.chartBlue,
  productSales: COLORS.chartEmerald,
  /** Paleta rotatoria para categorías múltiples (top N productos, etc.). */
  palette: [
    COLORS.chartAmber,
    COLORS.chartRose,
    COLORS.chartSky,
    COLORS.chartEmerald,
    COLORS.chartViolet,
  ],
} as const
