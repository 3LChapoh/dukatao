import { useEffect, useState } from 'react'
import { categoriesApi } from '../../api'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useToast } from '../../context/ToastContext'

const emptyForm = { name: '', description: '', color: '#4d91c9', isActive: true }

function CategoryForm({ initial, onSubmit, onCancel, busy }) {
  const [form, setForm] = useState(() => ({ ...emptyForm, ...initial }))

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function submit(e) {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form className="form" onSubmit={submit}>
      <label>
        Name
        <input className="field" required value={form.name} onChange={(e) => update('name', e.target.value)} />
      </label>
      <label>
        Description
        <textarea className="field" value={form.description} onChange={(e) => update('description', e.target.value)} />
      </label>
      <label>
        Accent color
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="color"
            value={form.color}
            onChange={(e) => update('color', e.target.value)}
            style={{ width: 40, height: 36, padding: 0, border: 'none', background: 'none' }}
          />
          <input className="field" value={form.color} onChange={(e) => update('color', e.target.value)} />
        </div>
      </label>
      {initial?._id && (
        <label style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={form.isActive} onChange={(e) => update('isActive', e.target.checked)} />
          Visible on storefront
        </label>
      )}
      <div className="actions">
        <button className="goldbtn" disabled={busy}>
          {busy ? 'Saving…' : initial?._id ? 'Save changes' : 'Add category'}
        </button>
        {onCancel && (
          <button type="button" className="ghostbtn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default function AdminCategories() {
  const { token } = useAdminAuth()
  const showToast = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null | 'new' | category
  const [busy, setBusy] = useState(false)

  function reload() {
    setLoading(true)
    categoriesApi
      .list(token)
      .then(setCategories)
      .catch((err) => showToast(err.message, true))
      .finally(() => setLoading(false))
  }

  useEffect(reload, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(form) {
    setBusy(true)
    try {
      if (editing === 'new') {
        await categoriesApi.create(form, token)
        showToast('Category added')
      } else {
        await categoriesApi.update(editing._id, form, token)
        showToast('Category updated')
      }
      setEditing(null)
      reload()
    } catch (err) {
      showToast(err.message || 'Could not save category', true)
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await categoriesApi.remove(id, token)
      showToast('Category deleted')
      reload()
    } catch (err) {
      showToast(err.message || 'Could not delete category', true)
    }
  }

  async function handleToggleActive(cat) {
    try {
      await categoriesApi.update(cat._id, { isActive: !cat.isActive }, token)
      reload()
    } catch (err) {
      showToast(err.message || 'Could not update category', true)
    }
  }

  async function move(index, direction) {
    const target = index + direction
    if (target < 0 || target >= categories.length) return
    const reordered = [...categories]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    setCategories(reordered) // optimistic
    try {
      await categoriesApi.reorder(
        reordered.map((c) => c._id),
        token
      )
    } catch (err) {
      showToast(err.message || 'Could not reorder categories', true)
      reload()
    }
  }

  if (editing) {
    return (
      <div className="mini-grid">
        <h3 style={{ fontSize: 14, marginBottom: 10 }}>
          {editing === 'new' ? 'Add category' : `Edit "${editing.name}"`}
        </h3>
        <CategoryForm initial={editing === 'new' ? null : editing} onSubmit={handleSubmit} onCancel={() => setEditing(null)} busy={busy} />
      </div>
    )
  }

  return (
    <div>
      <div className="actions" style={{ marginBottom: 14 }}>
        <button className="goldbtn" onClick={() => setEditing('new')}>
          + Add category
        </button>
      </div>
      {loading && <div className="notice">Loading categories…</div>}
      {!loading && categories.length === 0 && <div className="notice">No categories yet.</div>}
      <div className="mini-grid">
        {categories.map((c, i) => (
          <div className="mini" key={c._id} style={{ opacity: c.isActive ? 1 : 0.55 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ width: 14, height: 14, borderRadius: '50%', background: c.color, display: 'inline-block' }} />
              <strong>{c.name}</strong>
            </div>
            <span className="muted" style={{ fontSize: 12 }}>
              {c.description || 'No description'}
            </span>
            <br />
            <span className="muted" style={{ fontSize: 11 }}>
              {c.isActive ? 'Visible on storefront' : 'Hidden from storefront'}
            </span>
            <div className="actions" style={{ marginTop: 8, flexWrap: 'wrap' }}>
              <button className="tiny" onClick={() => move(i, -1)} disabled={i === 0}>
                ↑
              </button>
              <button className="tiny" onClick={() => move(i, 1)} disabled={i === categories.length - 1}>
                ↓
              </button>
              <button className="tiny" onClick={() => handleToggleActive(c)}>
                {c.isActive ? 'Hide' : 'Show'}
              </button>
              <button className="tiny" onClick={() => setEditing(c)}>
                Edit
              </button>
              <button className="tiny danger" onClick={() => handleDelete(c._id, c.name)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
