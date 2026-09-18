import { useEffect, useState } from 'react'
import { imageUrl, productsApi, categoriesApi } from '../../api'
import { money } from '../../utils'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useToast } from '../../context/ToastContext'
import ProductForm from '../ProductForm'

export default function AdminProducts() {
  const { token } = useAdminAuth()
  const showToast = useToast()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null | 'new' | product
  const [busy, setBusy] = useState(false)

  function reload() {
    setLoading(true)
    Promise.all([productsApi.list(), categoriesApi.list(token)])
      .then(([productList, categoryList]) => {
        setProducts(productList)
        setCategories(categoryList)
      })
      .catch((err) => showToast(err.message, true))
      .finally(() => setLoading(false))
  }

  useEffect(reload, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(form, files, replaceImages) {
    setBusy(true)
    try {
      if (editing === 'new') {
        await productsApi.create(form, files, token)
        showToast('Product added')
      } else {
        await productsApi.update(editing._id, { ...form, replaceImages: replaceImages ? 'true' : 'false' }, files, token)
        showToast('Product updated')
      }
      setEditing(null)
      reload()
    } catch (err) {
      showToast(err.message || 'Could not save product', true)
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product? This cannot be undone.')) return
    try {
      await productsApi.remove(id, token)
      showToast('Product deleted')
      reload()
    } catch (err) {
      showToast(err.message || 'Could not delete product', true)
    }
  }

  if (editing) {
    return (
      <div className="mini-grid">
        <h3 style={{ fontSize: 14, marginBottom: 10 }}>{editing === 'new' ? 'Add product' : `Edit "${editing.name}"`}</h3>
        <ProductForm initial={editing === 'new' ? null : editing} categories={categories} onSubmit={handleSubmit} onCancel={() => setEditing(null)} busy={busy} />
      </div>
    )
  }

  return (
    <div>
      <div className="actions" style={{ marginBottom: 14 }}>
        <button className="goldbtn" onClick={() => setEditing('new')} disabled={categories.length === 0}>
          + Add product
        </button>
      </div>
      {!loading && categories.length === 0 && (
        <div className="notice">Add a category first (Categories tab) before adding products.</div>
      )}
      {loading && <div className="notice">Loading products…</div>}
      <div className="mini-grid">
        {products.map((p) => {
          const stockColor = p.stock === 0 ? '#f87171' : p.stock <= 5 ? '#c9a24b' : undefined
          return (
          <div className="mini" key={p._id}>
            {p.images?.[0] && <img src={imageUrl(p.images[0].url)} alt="" style={{ width: '100%', borderRadius: 8, marginBottom: 6 }} />}
            <strong>{p.name}</strong>
            <br />
            <span className="muted">{p.category?.name || 'Uncategorized'}</span>
            <br />
            <span className="mono">{money(p.price)}</span> ·{' '}
            <span className="muted" style={{ color: stockColor, fontWeight: stockColor ? 600 : undefined }}>
              {p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}
            </span>
            <div className="actions" style={{ marginTop: 8 }}>
              <button className="tiny" onClick={() => setEditing(p)}>
                Edit
              </button>
              <button className="tiny danger" onClick={() => handleDelete(p._id)}>
                Delete
              </button>
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}
