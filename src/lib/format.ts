export function formatMoneyArs(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

const AR_TIMEZONE = 'America/Argentina/Buenos_Aires'

/** Fecha/hora corta en es-AR, estable entre SSR (Node) y navegador. */
export function formatDateTimeAr(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  const parts = new Intl.DateTimeFormat('es-AR', {
    timeZone: AR_TIMEZONE,
    day: 'numeric',
    month: 'numeric',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ''

  const hour24 = Number(pick('hour'))
  const minute = pick('minute').padStart(2, '0')
  const period = hour24 >= 12 ? 'p. m.' : 'a. m.'
  const hour12 = hour24 % 12 || 12

  return `${pick('day')}/${pick('month')}/${pick('year')}, ${hour12}:${minute} ${period}`
}

/** Categorías y subcategorías siempre en mayúsculas (es-AR). */
export function upperCategoryLabel(name: string): string {
  return name.trim().toLocaleUpperCase('es-AR')
}
