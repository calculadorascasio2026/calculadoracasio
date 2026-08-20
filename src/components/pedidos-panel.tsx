'use client'

import { appBaseUrl } from '@/lib/app-url'
import { formatDateTimeAr, formatMoneyArs } from '@/lib/format'
import { createClient } from '@/lib/supabase/browser'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

export type PedidoAdminRow = {
  id: string
  status: 'pending' | 'seen' | 'closed'
  created_at: string
  total: number
  lineCount: number
}

function statusLabel(s: PedidoAdminRow['status']) {
  if (s === 'pending') return 'Pendiente'
  if (s === 'seen') return 'Visto'
  return 'Cerrado'
}

function statusClass(s: PedidoAdminRow['status']) {
  if (s === 'pending') return 'border-amber-500/40 bg-amber-950/30 text-amber-200'
  if (s === 'seen') return 'border-casio-lime/40 bg-casio-lime/10 text-casio-lime'
  return 'border-white/15 bg-white/5 text-casio-muted'
}

export function PedidosPanel({ initialRows }: { initialRows: PedidoAdminRow[] }) {
  const router = useRouter()
  const [tab, setTab] = useState<'abiertos' | 'cerrados'>('abiertos')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const sb = useMemo(() => createClient(), [])

  const abiertos = useMemo(
    () => initialRows.filter((r) => r.status !== 'closed'),
    [initialRows],
  )
  const cerrados = useMemo(
    () => initialRows.filter((r) => r.status === 'closed'),
    [initialRows],
  )
  const rows = tab === 'abiertos' ? abiertos : cerrados

  async function setStatus(id: string, status: PedidoAdminRow['status']) {
    setBusyId(id)
    setErr(null)
    try {
      const { error } = await sb.from('orders').update({ status }).eq('id', id)
      if (error) throw error
      router.refresh()
    } catch {
      setErr('No se pudo actualizar el pedido')
    } finally {
      setBusyId(null)
    }
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar este pedido?')) return
    setBusyId(id)
    setErr(null)
    try {
      const { error } = await sb.from('orders').delete().eq('id', id)
      if (error) throw error
      router.refresh()
    } catch {
      setErr('No se pudo eliminar')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab('abiertos')}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${
            tab === 'abiertos' ? 'bg-casio-lime text-black' : 'border border-white/10 text-casio-muted'
          }`}
        >
          Abiertos ({abiertos.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('cerrados')}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${
            tab === 'cerrados' ? 'bg-casio-lime text-black' : 'border border-white/10 text-casio-muted'
          }`}
        >
          Cerrados ({cerrados.length})
        </button>
      </div>

      {err ? <p className="text-sm text-red-300">{err}</p> : null}

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-casio-muted">
          {tab === 'abiertos' ? 'No hay pedidos abiertos.' : 'No hay pedidos cerrados.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const link = `/p/${r.id}`
            const busy = busyId === r.id
            return (
              <li
                key={r.id}
                className="rounded-2xl border border-white/10 bg-casio-surface p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {r.lineCount} producto{r.lineCount === 1 ? '' : 's'} · {formatMoneyArs(r.total)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-casio-muted">{formatDateTimeAr(r.created_at)}</p>
                    <Link
                      href={link}
                      target="_blank"
                      className="mt-1 inline-block break-all text-[11px] text-casio-lime hover:underline"
                    >
                      {`${appBaseUrl()}${link}`}
                    </Link>
                  </div>
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${statusClass(r.status)}`}>
                    {statusLabel(r.status)}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.status === 'pending' ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void setStatus(r.id, 'seen')}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-[11px] font-semibold hover:border-casio-lime/40 disabled:opacity-40"
                    >
                      Marcar visto
                    </button>
                  ) : null}
                  {r.status !== 'closed' ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void setStatus(r.id, 'closed')}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-[11px] font-semibold hover:border-casio-lime/40 disabled:opacity-40"
                    >
                      Cerrar
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void setStatus(r.id, 'pending')}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-[11px] font-semibold hover:border-casio-lime/40 disabled:opacity-40"
                    >
                      Reabrir
                    </button>
                  )}
                  <Link
                    href={link}
                    target="_blank"
                    className="rounded-lg bg-casio-lime/90 px-3 py-1.5 text-[11px] font-bold text-black hover:bg-casio-lime"
                  >
                    Ver pedido
                  </Link>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void remove(r.id)}
                    className="rounded-lg px-3 py-1.5 text-[11px] text-red-300/90 hover:bg-red-950/40 disabled:opacity-40"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
