'use client'

import {
  DESC_NEON_GREEN,
  autoFormatDescriptionHtml,
  looksLikeHtml,
  sanitizeDescriptionHtml,
} from '@/lib/description-html'
import { useEffect, useId, useRef } from 'react'

const COLORS = [
  { label: 'Neón', value: DESC_NEON_GREEN },
  { label: 'Lime', value: '#b8e020' },
  { label: 'Blanco', value: '#f5f5f5' },
  { label: 'Gris', value: '#9ca3af' },
  { label: 'Rojo', value: '#ff4d4d' },
  { label: 'Cyan', value: '#00e5ff' },
  { label: 'Amarillo', value: '#ffe600' },
]

type Props = {
  value: string
  onChange: (html: string) => void
  disabled?: boolean
}

export function DescriptionRichEditor({ value, onChange, disabled }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const id = useId()
  const syncingRef = useRef(false)

  useEffect(() => {
    const el = editorRef.current
    if (!el || syncingRef.current) return
    const next = value || ''
    if (el.innerHTML !== next) {
      el.innerHTML = next
    }
  }, [value])

  function emitChange() {
    const el = editorRef.current
    if (!el) return
    syncingRef.current = true
    onChange(sanitizeDescriptionHtml(el.innerHTML))
    requestAnimationFrame(() => {
      syncingRef.current = false
    })
  }

  function runCommand(command: string, commandValue?: string) {
    if (disabled) return
    editorRef.current?.focus()
    document.execCommand(command, false, commandValue)
    emitChange()
  }

  function applyAutoFormat() {
    if (disabled) return
    const raw = editorRef.current?.innerText ?? value
    const formatted = autoFormatDescriptionHtml(raw, DESC_NEON_GREEN)
    if (editorRef.current) {
      editorRef.current.innerHTML = formatted
    }
    onChange(formatted)
  }

  return (
    <div className="mt-1 overflow-hidden rounded-lg border border-white/10 bg-black/40">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/10 px-2 py-1.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => runCommand('bold')}
          className="rounded px-2 py-1 text-xs font-bold text-white hover:bg-white/10 disabled:opacity-40"
          title="Negrita"
        >
          B
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => runCommand('italic')}
          className="rounded px-2 py-1 text-xs italic text-white hover:bg-white/10 disabled:opacity-40"
          title="Cursiva"
        >
          I
        </button>
        <span className="mx-1 h-4 w-px bg-white/15" aria-hidden />
        <span className="text-[10px] text-casio-muted">Color</span>
        {COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            disabled={disabled}
            title={c.label}
            onClick={() => runCommand('foreColor', c.value)}
            className="h-5 w-5 rounded-full border border-white/20 disabled:opacity-40"
            style={{ backgroundColor: c.value }}
            aria-label={`Color ${c.label}`}
          />
        ))}
        <input
          type="color"
          disabled={disabled}
          defaultValue={DESC_NEON_GREEN}
          onChange={(e) => runCommand('foreColor', e.target.value)}
          className="ml-1 h-6 w-7 cursor-pointer rounded border border-white/15 bg-transparent disabled:opacity-40"
          title="Color personalizado"
          aria-label="Color personalizado"
        />
        <span className="mx-1 h-4 w-px bg-white/15" aria-hidden />
        <button
          type="button"
          disabled={disabled}
          onClick={applyAutoFormat}
          className="rounded border border-casio-lime/40 px-2 py-1 text-[10px] font-semibold text-casio-lime hover:bg-casio-lime/10 disabled:opacity-40"
          title="Pone las etiquetas (Dígitos:, Pantalla:, …) en verde neón y negrita"
        >
          Formato ficha
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => runCommand('removeFormat')}
          className="rounded px-2 py-1 text-[10px] text-casio-muted hover:bg-white/10 disabled:opacity-40"
        >
          Quitar formato
        </button>
      </div>
      <div
        id={id}
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        aria-label="Descripción del producto"
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        className="min-h-[7.5rem] px-3 py-2 text-sm leading-relaxed text-white outline-none empty:before:pointer-events-none empty:before:text-casio-muted empty:before:content-[attr(data-placeholder)]"
        data-placeholder="Ej: Dígitos: 12 — usá «Formato ficha» para etiquetas en verde neón"
      />
      {!looksLikeHtml(value) && value.trim() ? (
        <p className="border-t border-white/10 px-3 py-1.5 text-[10px] text-casio-muted">
          Tip: tocá «Formato ficha» para poner las etiquetas en verde neón y negrita.
        </p>
      ) : null}
    </div>
  )
}
