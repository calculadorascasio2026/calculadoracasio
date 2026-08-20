'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { compressProductImageFile } from '@/lib/compress-product-image'
import { formatMoneyArs } from '@/lib/format'
import { productImagePublicUrl } from '@/lib/image-url'
import { createClient } from '@/lib/supabase/browser'
import type { CategoryRow, ProductRow } from '@/types/catalog'

type Props = {
  categories: CategoryRow[]
  initialProducts: ProductRow[]
  supabaseUrl: string
}

type Draft = {
  id?: string
  category_id: string
  name: string
  description: string
  price: string
  active: boolean
  sort_order: string
  image_path: string | null
}

function emptyDraft(categoryId: string): Draft {
  return {
    category_id: categoryId,
    name: '',
    description: '',
    price: '',
    active: true,
    sort_order: '0',
    image_path: null,
  }
}

export function AdminProductsPanel({ categories, initialProducts, supabaseUrl }: Props) {
  const sb = useMemo(() => createClient(), [])
  const [products, setProducts] = useState(initialProducts)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const defaultCategory = categories[0]?.id ?? ''

  function openNew() {
    setError('')
    setDraft(emptyDraft(defaultCategory))
  }

  function openEdit(p: ProductRow) {
    setError('')
    setDraft({
      id: p.id,
      category_id: p.category_id,
      name: p.name,
      description: p.description ?? '',
      price: String(p.price),
      active: p.active,
      sort_order: String(p.sort_order),
      image_path: p.image_path,
    })
  }

  async function handleImage(file: File | null) {
    if (!file || !draft) return
    setUploading(true)
    setError('')
    try {
      const compressed = await compressProductImageFile(file)
      const path = `${crypto.randomUUID()}.webp`
      const { error: upErr } = await sb.storage.from('product-images').upload(path, compressed, {
        contentType: compressed.type,
        upsert: false,
      })
      if (upErr) throw upErr
      setDraft({ ...draft, image_path: path })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!draft) return
    setSaving(true)
    setError('')

    const price = Number(draft.price.replace(',', '.'))
    const sort_order = Number(draft.sort_order) || 0
    if (!draft.name.trim() || Number.isNaN(price) || price < 0) {
      setSaving(false)
      setError('Completá nombre y precio válido.')
      return
    }

    const payload = {
      category_id: draft.category_id,
      name: draft.name.trim(),
      description: draft.description.trim() || null,
      price,
      active: draft.active,
      sort_order,
      image_path: draft.image_path,
    }

    try {
      if (draft.id) {
        const { data, error: upErr } = await sb
          .from('products')
          .update(payload)
          .eq('id', draft.id)
          .select('*')
          .single()
        if (upErr) throw upErr
        setProducts((prev) => prev.map((p) => (p.id === draft.id ? { ...p, ...data, price: Number(data.price) } : p)))
      } else {
        const { data, error: insErr } = await sb.from('products').insert(payload).select('*').single()
        if (insErr) throw insErr
        setProducts((prev) => [...prev, { ...data, price: Number(data.price) } as ProductRow])
      }
      setDraft(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este producto?')) return
    setError('')
    const { error: delErr } = await sb.from('products').delete().eq('id', id)
    if (delErr) {
      setError(delErr.message)
      return
    }
    setProducts((prev) => prev.filter((p) => p.id !== id))
    if (draft?.id === id) setDraft(null)
  }

  async function toggleActive(p: ProductRow) {
    const { error: upErr } = await sb.from('products').update({ active: !p.active }).eq('id', p.id)
    if (upErr) {
      setError(upErr.message)
      return
    }
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, active: !x.active } : x)))
  }

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? '—'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-casio text-3xl tracking-wide text-casio-lime">PRODUCTOS</h1>
          <p className="mt-1 text-sm text-casio-muted">{products.length} cargados</p>
        </div>
        <button
          type="button"
          onClick={openNew}
          disabled={!defaultCategory}
          className="rounded-full bg-casio-lime px-4 py-2 text-sm font-semibold text-black hover:bg-casio-lime-dim disabled:opacity-50"
        >
          + Nuevo producto
        </button>
      </div>

      {error ? <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}

      {draft ? (
        <form onSubmit={handleSave} className="rounded-2xl border border-white/10 bg-casio-surface p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/80">
            {draft.id ? 'Editar producto' : 'Nuevo producto'}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs text-casio-muted">Nombre</label>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs text-casio-muted">Categoría</label>
              <select
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                value={draft.category_id}
                onChange={(e) => setDraft({ ...draft, category_id: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-casio-muted">Precio (ARS)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-casio-muted">Descripción</label>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-casio-muted">Orden</label>
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                value={draft.sort_order}
                onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })}
              />
            </div>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                />
                Visible en tienda
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-casio-muted">Imagen</label>
              <input
                type="file"
                accept="image/*"
                className="mt-1 block w-full text-sm text-casio-muted file:mr-3 file:rounded-lg file:border-0 file:bg-casio-lime file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-black"
                onChange={(e) => void handleImage(e.target.files?.[0] ?? null)}
                disabled={uploading}
              />
              {draft.image_path ? (
                <div className="mt-3 flex h-24 w-24 items-center justify-center rounded-lg border border-white/10 bg-black/40 p-2">
                  <Image
                    src={productImagePublicUrl(supabaseUrl, draft.image_path) ?? ''}
                    alt=""
                    width={80}
                    height={80}
                    className="max-h-full w-auto object-contain"
                    unoptimized
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving || uploading}
              className="rounded-full bg-casio-lime px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-casio-muted hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-casio-surface text-xs uppercase tracking-wide text-casio-muted">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-casio-muted">
                  Sin productos. Creá el primero con el botón de arriba.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const imgUrl = productImagePublicUrl(supabaseUrl, p.image_path)
                return (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/40">
                          {imgUrl ? (
                            <Image src={imgUrl} alt="" width={32} height={32} className="object-contain" unoptimized />
                          ) : (
                            <span className="font-casio text-xs text-white/20">C</span>
                          )}
                        </div>
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-casio-muted">{categoryName(p.category_id)}</td>
                    <td className="px-4 py-3">{formatMoneyArs(p.price)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => void toggleActive(p)}
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.active ? 'bg-casio-lime/20 text-casio-lime' : 'bg-white/10 text-casio-muted'
                        }`}
                      >
                        {p.active ? 'Activo' : 'Oculto'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => openEdit(p)} className="mr-2 text-casio-lime hover:underline">
                        Editar
                      </button>
                      <button type="button" onClick={() => void handleDelete(p.id)} className="text-red-400 hover:underline">
                        Borrar
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
