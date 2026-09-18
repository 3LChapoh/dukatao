import { useState } from 'react'

export default function ProductForm({ initial, categories, onSubmit, onCancel, busy }) {
  const empty = { name: '', price: '', category: categories[0]?._id || '', description: '', stock: '' }
  const [form, setForm] = useState(() => ({
    ...empty,
    ...initial,
    category: initial?.category?._id || initial?.category || empty.category,
  }))
  const [files, setFiles] = useState([])
  const [replaceImages, setReplaceImages] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function submit(e) {
    e.preventDefault()
    onSubmit(form, files, replaceImages)
  }

  return (
    <form className="form" onSubmit={submit}>
      <label>
        Name
        <input className="field" required value={form.name} onChange={(e) => update('name', e.target.value)} />
      </label>
      <label>
        Price (KES)
        <input className="field" type="number" min="0" required value={form.price} onChange={(e) => update('price', e.target.value)} />
      </label>
      <label>
        Category
        {categories.length === 0 ? (
          <span className="muted" style={{ fontSize: 12 }}>
            No categories yet — add one in the Categories tab first.
          </span>
        ) : (
          <select className="field" required value={form.category} onChange={(e) => update('category', e.target.value)}>
            {categories.map((c) => (
              <option value={c._id} key={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </label>
      <label>
        Stock
        <input className="field" type="number" min="0" required value={form.stock} onChange={(e) => update('stock', e.target.value)} />
      </label>
      <label>
        Description
        <textarea className="field" value={form.description} onChange={(e) => update('description', e.target.value)} />
      </label>
      <label>
        Photos
        <input className="field" type="file" accept="image/*" multiple onChange={(e) => setFiles([...e.target.files])} />
      </label>
      {initial?._id && (
        <label style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={replaceImages} onChange={(e) => setReplaceImages(e.target.checked)} />
          Replace existing photos instead of adding to them
        </label>
      )}
      <div className="actions">
        <button className="goldbtn" disabled={busy || categories.length === 0}>
          {busy ? 'Saving…' : initial?._id ? 'Save changes' : 'Add product'}
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
