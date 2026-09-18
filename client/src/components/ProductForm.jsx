import { useState } from 'react'
import { categories } from '../data/categories'

const empty = { name: '', price: '', category: categories[0].id, description: '', stock: '' }

export default function ProductForm({ initial, onSubmit, onCancel, busy }) {
  const [form, setForm] = useState(() => ({ ...empty, ...initial }))
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
        <select className="field" value={form.category} onChange={(e) => update('category', e.target.value)}>
          {categories.map((c) => (
            <option value={c.id} key={c.id}>
              {c.name}
            </option>
          ))}
        </select>
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
        <button className="goldbtn" disabled={busy}>
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
