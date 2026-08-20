'use client'

import Image from 'next/image'
import { useMemo, useRef, useState } from 'react'
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
  stock: string
  sort_order: number
  image_path: string | null
}

function emptyDraft(categoryId: string): Draft {
  return {
    category_id: categoryId,
    name: '',
    description: '',
    price: '',
    active: true,
    stock: '1',
    sort_order: 0,
    image_path: null,
  }
}

function normalizeProduct(row: Record<string, unknown> | ProductRow): ProductRow {
  return {
    id: String(row.id),
    category_id: String(row.category_id),
    name: String(row.name),
    description: row.description != null ? String(row.description) : null,
    price: Number(row.price),
    image_path: row.image_path != null ? String(row.image_path) : null,
    active: Boolean(row.active),
    stock: Number(
      'stock' in row && row.stock != null
        ? row.stock
        : (row as { in_stock?: boolean }).in_stock === false
          ? 0
          : 1,
    ),
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }
}

function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function AdminProductsPanel({ categories: initialCategories, initialProducts, supabaseUrl }: Props) {
  const sb = useMemo(() => createClient(), [])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [categories, setCategories] = useState(initialCategories)
  const [products, setProducts] = useState(initialProducts.map(normalizeProduct))
  const [draft, setDraft] = useState<Draft | null>(null)
  const [categoryDraft, setCategoryDraft] = useState<{ name: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [savingCategory, setSavingCategory] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  function openNewCategory() {
    setError('')
    setDraft(null)
    setCategoryDraft({ name: '' })
  }

  function openEdit(p: ProductRow) {
    setError('')
    setCategoryDraft(null)
    setDraft({
      id: p.id,
      category_id: p.category_id,
      name: p.name,
      description: p.description ?? '',
      price: String(p.price),
      active: p.active,
      stock: String(p.stock),
      sort_order: p.sort_order,
      image_path: p.image_path,
    })
  }

  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!categoryDraft) return
    const name = categoryDraft.name.trim()
    if (!name) {
      setError('Escribí el nombre de la categoría.')
      return
    }
    const slug = slugify(name)
    if (!slug) {
      setError('El nombre de la categoría no es válido.')
      return
    }
    setSavingCategory(true)
    setError('')
    try {
      const maxOrder = categories.reduce((m, c) => Math.max(m, c.sort_order), 0)
      const { data, error: insErr } = await sb
        .from('categories')
        .insert({ name, slug, sort_order: maxOrder + 1 })
        .select('*')
        .single()
      if (insErr) throw insErr
      setCategories((prev) => [
        ...prev,
        {
          id: String(data.id),
          name: String(data.name),
          slug: String(data.slug),
          sort_order: Number(data.sort_order ?? 0),
        },
      ])
      setCategoryDraft(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la categoría')
    } finally {
      setSavingCategory(false)
    }
  }

  async function handleImage(file: File | null) {
    if (!file || !draft) return
    setUploading(true)
    setError('')
    try {
      const compressed = await compressProductImageFile(file)
      const path = `${crypto.randomUUID()}.webp`
      const { error: upErr } = await sb.storage.from('product-images').upload(path, compressed, {
        contentType: compressed.type || 'image/webp',
        upsert: false,
      })
      if (upErr) throw upErr
      setDraft({ ...draft, image_path: path })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir la imagen')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!draft) return
    setSaving(true)
    setError('')

    const price = Number(draft.price.replace(',', '.'))
    const stock = Math.max(0, Math.floor(Number(draft.stock.replace(',', '.'))))
    if (!draft.name.trim() || Number.isNaN(price) || price < 0 || Number.isNaN(stock)) {
      setSaving(false)
      setError('Completá nombre, precio y stock válidos.')
      return
    }

    const payload = {
      category_id: draft.category_id,
      name: draft.name.trim(),
      description: draft.description.trim() || null,
      price,
      active: draft.active,
      stock,
      in_stock: stock >= 1,
      sort_order: draft.sort_order,
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
        const mapped = normalizeProduct(data)
        setProducts((prev) => prev.map((p) => (p.id === draft.id ? mapped : p)))
      } else {
        const { data, error: insErr } = await sb.from('products').insert(payload).select('*').single()
        if (insErr) throw insErr
        setProducts((prev) => [...prev, normalizeProduct(data)])
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

  const productsByCategory = useMemo(() => {
    const sortedCategories = [...categories].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
    return sortedCategories.map((category) => ({
      category,
      products: products
        .filter((p) => p.category_id === category.id)
        .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)),
    }))
  }, [categories, products])

  const uncategorized = useMemo(
    () => products.filter((p) => !categories.some((c) => c.id === p.category_id)),
    [categories, products],
  )

  function openNewInCategory(categoryId: string) {
    setError('')
    setCategoryDraft(null)
    setDraft(emptyDraft(categoryId))
  }

  const draftImageUrl = draft?.image_path ? productImagePublicUrl(supabaseUrl, draft.image_path) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-casio text-3xl tracking-wide text-casio-lime">PRODUCTOS</h1>
          <p className="mt-1 text-sm text-casio-muted">
            {products.length} cargados · {categories.length} categorías
          </p>
        </div>
        <button
          type="button"
          onClick={openNewCategory}
          className="rounded-full bg-casio-lime px-4 py-2 text-sm font-semibold text-black hover:bg-casio-lime-dim"
        >
          + Nueva categoría
        </button>
      </div>

      {error ? <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}

      {categoryDraft ? (
        <form onSubmit={handleSaveCategory} className="space-y-4 rounded-2xl border border-white/10 bg-casio-surface p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/80">Nueva categoría</h2>
          <div>
            <label className="text-xs text-casio-muted">Nombre</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
              value={categoryDraft.name}
              onChange={(e) => setCategoryDraft({ name: e.target.value })}
              placeholder="Ej. Gráficas"
              required
              autoFocus
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={savingCategory}
              className="rounded-full bg-casio-lime px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
            >
              {savingCategory ? 'Guardando…' : 'Crear categoría'}
            </button>
            <button
              type="button"
              onClick={() => setCategoryDraft(null)}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-casio-muted hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : null}

      {draft ? (
        <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-white/10 bg-casio-surface p-5">
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
              <label className="text-xs text-casio-muted">Stock</label>
              <input
                type="number"
                min="0"
                step="1"
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                value={draft.stock}
                onChange={(e) => setDraft({ ...draft, stock: e.target.value })}
                required
              />
              <p className="mt-1 text-[11px] text-casio-muted">Si es 0, en la tienda se muestra “Sin stock”.</p>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                />
                Disponible en tienda
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-casio-muted">Foto del producto</label>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-black/50">
                  {draftImageUrl ? (
                    <Image
                      src={draftImageUrl}
                      alt="Vista previa"
                      width={80}
                      height={80}
                      className="h-full w-full object-contain p-1.5"
                      unoptimized
                    />
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-8 w-8 text-white/25" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="m21 15-5-5L5 21" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => void handleImage(e.target.files?.[0] ?? null)}
                    disabled={uploading}
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full bg-casio-lime px-4 py-2 text-xs font-semibold text-black hover:bg-casio-lime-dim disabled:opacity-50"
                  >
                    {uploading ? 'Optimizando imagen…' : draft.image_path ? 'Cambiar foto' : 'Elegir foto'}
                  </button>
                  {draft.image_path ? (
                    <button
                      type="button"
                      className="block text-[11px] text-red-400 hover:underline"
                      onClick={() => setDraft({ ...draft, image_path: null })}
                    >
                      Quitar foto
                    </button>
                  ) : null}
                </div>
              </div>
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

      {products.length === 0 && categories.length === 0 ? (
        <p className="rounded-2xl border border-white/10 px-4 py-8 text-center text-casio-muted">
          Sin categorías ni productos.
        </p>
      ) : null}

      <div className="space-y-5">
        {productsByCategory.map(({ category, products: catProducts }) => (
          <section key={category.id} className="overflow-hidden rounded-2xl border border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-casio-surface px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold tracking-wide text-casio-lime">{category.name}</h2>
                <p className="text-xs text-casio-muted">
                  {catProducts.length} producto{catProducts.length === 1 ? '' : 's'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openNewInCategory(category.id)}
                className="rounded-full border border-casio-lime/40 px-3 py-1 text-xs font-semibold text-casio-lime hover:bg-casio-lime/10"
              >
                + En esta categoría
              </button>
            </div>

            {catProducts.length === 0 ? (
              <p className="px-4 py-6 text-sm text-casio-muted">Todavía no hay productos en esta categoría.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-white/5 text-xs uppercase tracking-wide text-casio-muted">
                    <tr>
                      <th className="px-4 py-2.5">Producto</th>
                      <th className="px-4 py-2.5">Precio</th>
                      <th className="px-4 py-2.5">Stock</th>
                      <th className="px-4 py-2.5">Estado</th>
                      <th className="px-4 py-2.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catProducts.map((p) => {
                      const imgUrl = productImagePublicUrl(supabaseUrl, p.image_path)
                      return (
                        <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/40">
                                {imgUrl ? (
                                  <Image
                                    src={imgUrl}
                                    alt=""
                                    width={48}
                                    height={48}
                                    className="h-full w-full object-contain p-1"
                                    unoptimized
                                  />
                                ) : (
                                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-white/20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <path d="m21 15-5-5L5 21" />
                                  </svg>
                                )}
                              </div>
                              <span className="font-medium">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">{formatMoneyArs(p.price)}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                p.stock >= 1 ? 'bg-casio-lime/20 text-casio-lime' : 'bg-amber-500/15 text-amber-300'
                              }`}
                            >
                              {p.stock >= 1 ? p.stock : 'Sin stock'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => void toggleActive(p)}
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                p.active ? 'bg-casio-lime/20 text-casio-lime' : 'bg-white/10 text-casio-muted'
                              }`}
                            >
                              {p.active ? 'Disponible' : 'No disponible'}
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
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}

        {uncategorized.length > 0 ? (
          <section className="overflow-hidden rounded-2xl border border-red-500/20">
            <div className="border-b border-red-500/20 bg-red-500/10 px-4 py-3">
              <h2 className="text-sm font-semibold text-red-300">Sin categoría</h2>
              <p className="text-xs text-red-300/70">{uncategorized.length} producto(s)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <tbody>
                  {uncategorized.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 last:border-0">
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-casio-muted">{categoryName(p.category_id)}</td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" onClick={() => openEdit(p)} className="text-casio-lime hover:underline">
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
