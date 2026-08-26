/**
 * One-off: actualiza descripciones HTML de productos por ID.
 * Uso: node scripts/seed-product-descriptions.mjs
 */
import postgres from 'postgres'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const NEON = '#39FF14'

function specHtml(specs) {
  return specs
    .map(({ label, value }) => {
      const lab = label.replace(/:\s*$/, '')
      const val = value || '—'
      return `<div><strong style="color:${NEON}">${lab}:</strong> ${escapeHtml(val)}</div>`
    })
    .join('')
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** @type {Record<string, Array<{label: string, value: string}>>} */
const SPECS = {
  'f98a3dd5-bd1b-4f02-8642-2a15ce48c92b': [
    { label: 'Dígitos', value: '10 + 2' },
    { label: 'Pantalla', value: 'Natural de alta resolución, 4 gradaciones' },
    { label: 'Alimentación', value: '1 pila AAA' },
    { label: 'Memoria', value: '9 variables + memoria de respuesta' },
    {
      label: 'Funciones',
      value:
        '420 aprox. — matrices, vectores, números complejos, ecuaciones, integrales, diferenciales, estadísticas, distribución, hoja de cálculo, QR',
    },
    { label: 'Decimales', value: 'FIX / SCI / NORM' },
    { label: 'Redondeo', value: 'Sí' },
    { label: 'Formato', value: 'Científica' },
    { label: 'Tipo de uso', value: 'Secundaria / Universidad / Ingeniería' },
  ],
  'bad5a0f2-eb17-4dbb-ba44-c9e743a8aff7': [
    { label: 'Dígitos', value: '10 + 2' },
    { label: 'Pantalla', value: 'Natural, matriz de puntos' },
    { label: 'Alimentación', value: '1 pila AAA' },
    { label: 'Memoria', value: '9 variables + memoria independiente + memoria de respuesta' },
    {
      label: 'Funciones',
      value:
        '417 — matrices, vectores, números complejos, ecuaciones, integrales, diferenciales, estadísticas y SOLVE',
    },
    { label: 'Decimales', value: 'FIX / SCI / NORM' },
    { label: 'Redondeo', value: 'Sí' },
    { label: 'Formato', value: 'Científica' },
    { label: 'Tipo de uso', value: 'Secundaria / Universidad / Ingeniería' },
  ],
  '5da3b447-5854-44ff-9d81-e4bf52eb8fae': [
    { label: 'Dígitos', value: '10 + 2' },
    { label: 'Pantalla', value: 'Natural de alta resolución, 4 gradaciones' },
    { label: 'Alimentación', value: '1 pila AAA' },
    { label: 'Memoria', value: '9 variables + memoria de respuesta' },
    {
      label: 'Funciones',
      value:
        'Funciones científicas básicas, trigonometría, fracciones, estadísticas, tabla, combinaciones y permutaciones',
    },
    { label: 'Decimales', value: 'FIX / SCI / NORM' },
    { label: 'Redondeo', value: 'Sí' },
    { label: 'Formato', value: 'Científica' },
    { label: 'Tipo de uso', value: 'Secundaria / Estudio' },
  ],
  '3605f391-2869-4d84-9841-fa36bea77a78': [
    { label: 'Dígitos', value: '10 + 2' },
    { label: 'Pantalla', value: 'Natural, matriz de puntos' },
    { label: 'Alimentación', value: '1 pila AAA' },
    { label: 'Memoria', value: '9 variables + memoria independiente + memoria de respuesta' },
    {
      label: 'Funciones',
      value:
        '274 — ecuaciones, desigualdades, estadísticas, fracciones, trigonometría, números aleatorios y tabla',
    },
    { label: 'Decimales', value: 'FIX / SCI / NORM' },
    { label: 'Redondeo', value: 'Sí' },
    { label: 'Formato', value: 'Científica' },
    { label: 'Tipo de uso', value: 'Secundaria / Universidad / Estudio' },
  ],
  '26764079-ac93-4085-9e04-64b82c2cb939': [
    { label: 'Dígitos', value: '10 + 2' },
    { label: 'Pantalla', value: 'Natural de alta resolución, 4 gradaciones' },
    { label: 'Alimentación', value: 'Solar + batería' },
    { label: 'Memoria', value: '9 variables + memoria de respuesta' },
    {
      label: 'Funciones',
      value:
        '540 aprox. — matrices, vectores, complejos, ecuaciones, integrales, diferenciales, estadísticas, distribución, hoja de cálculo, QR',
    },
    { label: 'Decimales', value: 'FIX / SCI / NORM' },
    { label: 'Redondeo', value: 'Sí' },
    { label: 'Formato', value: 'Científica avanzada' },
    { label: 'Tipo de uso', value: 'Universidad / Ingeniería / Ciencias' },
  ],
  'c4533223-e45a-402c-ba7f-4a9c687ad48d': [
    { label: 'Dígitos', value: '10 + 2' },
    { label: 'Pantalla', value: 'Natural, matriz de puntos' },
    { label: 'Alimentación', value: 'Solar + batería' },
    { label: 'Memoria', value: '9 variables + memoria independiente + memoria de respuesta' },
    {
      label: 'Funciones',
      value:
        '417 — matrices, vectores, complejos, ecuaciones, integrales, diferenciales, estadísticas y SOLVE',
    },
    { label: 'Decimales', value: 'FIX / SCI / NORM' },
    { label: 'Redondeo', value: 'Sí' },
    { label: 'Formato', value: 'Científica avanzada' },
    { label: 'Tipo de uso', value: 'Universidad / Ingeniería / Ciencias' },
  ],
  'c2a39e26-3745-4689-ab95-138fb0292287': [
    { label: 'Dígitos', value: '10 + 2' },
    { label: 'Pantalla', value: 'Natural, matriz de puntos' },
    { label: 'Alimentación', value: 'Solar + batería' },
    { label: 'Memoria', value: '9 variables + memoria independiente + memoria de respuesta' },
    {
      label: 'Funciones',
      value:
        '417 — matrices, vectores, complejos, ecuaciones, integrales, diferenciales, estadísticas y SOLVE',
    },
    { label: 'Decimales', value: 'FIX / SCI / NORM' },
    { label: 'Redondeo', value: 'Sí' },
    { label: 'Formato', value: 'Científica avanzada' },
    { label: 'Tipo de uso', value: 'Universidad / Ingeniería / Ciencias' },
  ],
  '58d18c4a-340a-4f40-9e76-77e3ee23bbc3': [
    { label: 'Dígitos', value: '10 + 2' },
    { label: 'Pantalla', value: 'Natural, matriz de puntos' },
    { label: 'Alimentación', value: 'Solar + batería' },
    { label: 'Memoria', value: '9 variables + memoria independiente + memoria de respuesta' },
    {
      label: 'Funciones',
      value:
        '417 — matrices, vectores, complejos, ecuaciones, integrales, diferenciales, estadísticas y SOLVE',
    },
    { label: 'Decimales', value: 'FIX / SCI / NORM' },
    { label: 'Redondeo', value: 'Sí' },
    { label: 'Formato', value: 'Científica avanzada' },
    { label: 'Tipo de uso', value: 'Universidad / Ingeniería / Ciencias' },
  ],
  'c69b293d-8091-4236-ab7b-a24ec707005d': [
    { label: 'Dígitos', value: '12' },
    { label: 'Pantalla', value: 'Visor luminoso' },
    { label: 'Alimentación', value: '220 V directo' },
    { label: 'Memoria', value: '4 teclas de memoria acumulativa' },
    {
      label: 'Funciones',
      value:
        '%, cambio de signo, TAX +/−, costo/precio/margen, gran total, contador de ítems, fecha y numeración',
    },
    { label: 'Decimales', value: 'Selector de punto decimal' },
    { label: 'Redondeo', value: 'Selector de redondeo' },
    { label: 'Formato', value: 'Escritorio con impresora' },
    { label: 'Tipo de uso', value: 'Uso intensivo / Comercio / Oficina / Contabilidad' },
    { label: 'Impresión', value: 'Bicolor, 4,3 líneas/segundo' },
  ],
  '2c0fe070-5797-4e36-9896-47537d6c8e4e': [
    { label: 'Dígitos', value: '12' },
    { label: 'Pantalla', value: 'Grande' },
    { label: 'Alimentación', value: 'Adaptador / corriente eléctrica' },
    { label: 'Memoria', value: 'Memoria independiente' },
    {
      label: 'Funciones',
      value: '%, cálculo comercial, gran total, contador de ítems, impresión de operaciones',
    },
    { label: 'Decimales', value: 'Selector decimal' },
    { label: 'Redondeo', value: 'Selector de redondeo' },
    { label: 'Formato', value: 'Escritorio con impresora' },
    { label: 'Tipo de uso', value: 'Comercio / Oficina / Contabilidad' },
    { label: 'Impresión', value: 'Con rollo' },
  ],
  '18d96d23-a2b6-4260-86e2-90924b2c4f8d': [
    { label: 'Dígitos', value: '12' },
    { label: 'Pantalla', value: 'Grande' },
    { label: 'Alimentación', value: 'Pilas / adaptador' },
    { label: 'Memoria', value: 'Independiente' },
    {
      label: 'Funciones',
      value: '%, margen de ganancia, MU/MD, TAX, conversión de divisas, REPRINT, CHECK, fecha y hora',
    },
    { label: 'Decimales', value: 'Selector decimal' },
    { label: 'Redondeo', value: 'Selector de redondeo' },
    { label: 'Formato', value: 'Escritorio con impresora' },
    { label: 'Tipo de uso', value: 'Comercio / Oficina / Contabilidad' },
    { label: 'Impresión', value: 'Bicolor, 1,7 líneas/segundo' },
  ],
  '117c3457-aae1-4251-adc0-8fd9f5105cba': [
    { label: 'Dígitos', value: '12' },
    { label: 'Pantalla', value: 'Grande' },
    { label: 'Alimentación', value: 'Pilas / adaptador' },
    { label: 'Memoria', value: 'Independiente' },
    {
      label: 'Funciones',
      value: '%, margen de ganancia, MU/MD, TAX, conversión de divisas, REPRINT, CHECK, fecha y hora',
    },
    { label: 'Decimales', value: 'Selector decimal' },
    { label: 'Redondeo', value: 'Selector de redondeo' },
    { label: 'Formato', value: 'Escritorio con impresora' },
    { label: 'Tipo de uso', value: 'Comercio / Oficina / Contabilidad' },
    { label: 'Impresión', value: 'Bicolor, 2,0 líneas/segundo' },
  ],
  '1a3245f7-8374-4633-a69a-d68178ae5413': [
    { label: 'Dígitos', value: '12' },
    { label: 'Pantalla', value: 'Grande' },
    { label: 'Alimentación', value: 'Pilas / adaptador' },
    { label: 'Memoria', value: 'Independiente' },
    {
      label: 'Funciones',
      value: '%, margen de ganancia, TAX, conversión de divisas, REPRINT, CHECK, apagado automático',
    },
    { label: 'Decimales', value: 'Selector decimal' },
    { label: 'Redondeo', value: 'Selector de redondeo' },
    { label: 'Formato', value: 'Escritorio compacto con impresora' },
    { label: 'Tipo de uso', value: 'Comercio / Oficina / Uso portátil' },
    { label: 'Impresión', value: '1,6 líneas/segundo' },
  ],
  'd2325c88-673b-4583-aa34-1a26700b4d62': [
    { label: 'Dígitos', value: '12' },
    { label: 'Pantalla', value: 'Grande' },
    { label: 'Alimentación', value: 'Pilas / adaptador' },
    { label: 'Memoria', value: 'Independiente' },
    {
      label: 'Funciones',
      value: '%, margen de ganancia, TAX, conversión de divisas, REPRINT, CHECK, apagado automático',
    },
    { label: 'Decimales', value: 'Selector decimal' },
    { label: 'Redondeo', value: 'Selector de redondeo' },
    { label: 'Formato', value: 'Escritorio compacto con impresora' },
    { label: 'Tipo de uso', value: 'Comercio / Oficina / Uso portátil' },
    { label: 'Impresión', value: '1,6 líneas/segundo' },
  ],
  '61aff31a-6432-44c4-b8ff-2ef1aa169cc1': [
    { label: 'Dígitos', value: '12' },
    { label: 'Pantalla', value: 'LCD retroiluminada bicolor' },
    { label: 'Alimentación', value: 'Corriente eléctrica' },
    { label: 'Memoria', value: '4 teclas de memoria' },
    {
      label: 'Funciones',
      value:
        '4 operaciones, %, margen de ganancia, contador de ítems, cálculo de impuestos, conversión de monedas, Call y Void',
    },
    { label: 'Decimales', value: '+ / 0 / 2 / 3 / 4 / FL' },
    { label: 'Redondeo', value: 'Arriba / 5/4 / Abajo' },
    { label: 'Formato', value: 'Escritorio con impresora' },
    { label: 'Tipo de uso', value: 'Uso intensivo / Comercio / Oficina / Contabilidad' },
    { label: 'Impresión', value: 'Bicolor, 3,5 líneas/segundo' },
  ],
  '47e2fe00-4131-4240-9566-ee025f787fc7': [
    { label: 'Velocidad de conteo', value: '1000 billetes/minuto' },
    { label: 'Capacidad de carga', value: 'Hasta 300 billetes' },
    { label: 'Detección de falsos', value: 'UV + MG' },
    { label: 'Funciones', value: 'ADD + BATCH' },
    { label: 'Pantalla', value: 'LCD multifunción' },
    { label: 'Alimentación', value: '220 V' },
    { label: 'Monedas', value: 'Dólares / Euros' },
    { label: 'Tipo de conteo', value: 'Conteo por cantidad' },
    { label: 'Alerta', value: 'Sonora ante billete sospechoso' },
    { label: 'Formato', value: 'Sobremesa' },
    { label: 'Tipo de uso', value: 'Comercio / Caja / Oficina / Uso intensivo' },
    { label: 'Peso', value: '6,5 kg' },
  ],
  '9a35f89c-58be-4b3f-be2e-ea572df944f9': [
    { label: 'Tipo', value: 'Controlador fiscal' },
    { label: 'Impresión', value: 'Térmica' },
    { label: 'Velocidad de impresión', value: '50 mm/s — 11 líneas/s' },
    { label: 'Ancho de papel', value: '80 mm' },
    { label: 'Alimentación', value: '220 V + batería' },
    { label: 'Memoria fiscal', value: '3650 Z — aprox. 10 años' },
    { label: 'Auditoría electrónica', value: 'Memoria SD 8 GB' },
    { label: 'Visores', value: 'Operador + cliente, LCD 16 × 2 líneas' },
    { label: 'Conectividad', value: 'USB / RS232 / Ethernet' },
    {
      label: 'Funciones',
      value:
        'Tickets, Ticket Factura A/B/C, Notas de Crédito y Débito, Remitos, Presupuestos, Recibos, reportes fiscales, consulta de precios, reimpresión, conversión de moneda, stock y libro IVA',
    },
    { label: 'PLU', value: 'Hasta 8450' },
    { label: 'Cajeros', value: 'Hasta 9' },
    { label: 'Cajón de dinero', value: 'Opcional' },
    { label: 'Formato', value: 'Escritorio' },
    { label: 'Tipo de uso', value: 'Comercio / Caja / Facturación / Uso intensivo' },
  ],
  '47f8ebbd-88a9-4a47-8e33-ac190152b475': [
    { label: 'Tipo', value: 'Registradora / Facturador electrónico' },
    { label: 'Impresión', value: 'Térmica' },
    { label: 'Velocidad de impresión', value: 'Alta velocidad' },
    { label: 'Ancho de papel', value: '57 mm' },
    { label: 'Alimentación', value: '220 V' },
    { label: 'Memoria', value: 'Hasta 1000 códigos PLU' },
    { label: 'Pantalla', value: 'LCD color de 5"' },
    { label: 'Sistema', value: 'Android' },
    { label: 'Teclado', value: '48 teclas físicas' },
    { label: 'Conectividad', value: 'Wi-Fi / Ethernet / USB' },
    {
      label: 'Funciones',
      value:
        'Facturación electrónica, emisión de comprobantes, gestión de ventas, cobro mediante QR, conexión online con ARCA',
    },
    { label: 'Cobro digital', value: 'QR Mercado Pago' },
    { label: 'Formato', value: 'Escritorio' },
    { label: 'Tipo de uso', value: 'Comercio / Caja / Facturación / Punto de venta' },
  ],
}

function loadDatabaseUrl() {
  try {
    const envPath = resolve(process.cwd(), '.env.local')
    const raw = readFileSync(envPath, 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^DATABASE_URL=(.+)$/)
      if (m) return m[1].trim().replace(/^["']|["']$/g, '')
    }
  } catch {
    /* ignore */
  }
  return process.env.DATABASE_URL
}

const dbUrl = loadDatabaseUrl()
if (!dbUrl) {
  console.error('Falta DATABASE_URL en .env.local')
  process.exit(1)
}

const sql = postgres(dbUrl, { ssl: 'require', max: 1 })

try {
  for (const [id, specs] of Object.entries(SPECS)) {
    const description = specHtml(specs)
    const rows = await sql`
      update products
      set description = ${description}, updated_at = now()
      where id = ${id}::uuid
      returning name
    `
    if (rows.length === 0) {
      console.warn('No encontrado:', id)
    } else {
      console.log('OK:', rows[0].name)
    }
  }
  console.log(`\nActualizados ${Object.keys(SPECS).length} productos.`)
} finally {
  await sql.end()
}
