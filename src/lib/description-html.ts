/** Color verde neón para etiquetas de ficha técnica */
export const DESC_NEON_GREEN = '#39FF14'

const ALLOWED_TAGS = new Set(['div', 'p', 'br', 'span', 'strong', 'b', 'em', 'i', 'u'])

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(div|p)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

export function formatSpecSheetHtml(
  specs: Array<{ label: string; value: string }>,
  labelColor: string = DESC_NEON_GREEN,
): string {
  return specs
    .map(({ label, value }) => {
      const lab = escapeHtml(label.replace(/:\s*$/, ''))
      const val = escapeHtml(value)
      return `<div><strong style="color:${labelColor}">${lab}:</strong> ${val}</div>`
    })
    .join('')
}

/** Aplica formato neón+bold a etiquetas de texto plano "Label: value". */
export function autoFormatDescriptionHtml(
  raw: string,
  labelColor: string = DESC_NEON_GREEN,
): string {
  const plain = looksLikeHtml(raw) ? stripHtml(raw) : raw
  const lines = plain
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length === 0) return ''

  return lines
    .map((line) => {
      const m = line.match(/^([^:]+):\s*(.*)$/)
      if (m) {
        const lab = escapeHtml(m[1].trim())
        const val = escapeHtml(m[2].trim() || '—')
        return `<div><strong style="color:${labelColor}">${lab}:</strong> ${val}</div>`
      }
      return `<div>${escapeHtml(line)}</div>`
    })
    .join('')
}

function sanitizeStyle(style: string): string {
  const allowed: string[] = []
  for (const part of style.split(';')) {
    const [rawProp, ...rest] = part.split(':')
    if (!rawProp || rest.length === 0) continue
    const prop = rawProp.trim().toLowerCase()
    const val = rest.join(':').trim()
    if (prop === 'color' && /^#[0-9a-f]{3,8}$/i.test(val)) {
      allowed.push(`color:${val}`)
    } else if (prop === 'font-weight' && /^(bold|bolder|[1-9]00)$/i.test(val)) {
      allowed.push(`font-weight:${val}`)
    } else if (prop === 'font-style' && /^(italic|normal)$/i.test(val)) {
      allowed.push(`font-style:${val}`)
    } else if (prop === 'text-decoration' && /^(underline|none)$/i.test(val)) {
      allowed.push(`text-decoration:${val}`)
    }
  }
  return allowed.join(';')
}

/**
 * Sanitiza HTML de descripciones (solo tags/estilos seguros).
 * Funciona en server y client (sin DOMParser).
 */
export function sanitizeDescriptionHtml(html: string): string {
  if (!html.trim()) return ''

  let cleaned = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/javascript:/gi, '')

  // Self-closing / void br
  cleaned = cleaned.replace(/<br\s*\/?>/gi, '<br>')

  // Rewrite open tags: keep only allowed + safe style
  cleaned = cleaned.replace(/<\/?([a-z0-9]+)(\s[^>]*)?>/gi, (full, tagName: string, attrs = '') => {
    const tag = tagName.toLowerCase()
    const isClose = full.startsWith('</')
    if (!ALLOWED_TAGS.has(tag)) return ''
    if (isClose) return tag === 'br' ? '' : `</${tag}>`
    if (tag === 'br') return '<br>'

    const styleMatch = attrs.match(/\sstyle\s*=\s*(["'])(.*?)\1/i)
    const safeStyle = styleMatch ? sanitizeStyle(styleMatch[2]) : ''
    return safeStyle ? `<${tag} style="${safeStyle}">` : `<${tag}>`
  })

  return cleaned
}
