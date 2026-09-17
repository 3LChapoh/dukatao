import { useState } from 'react'
import { categories } from '../../data/categories'


function ProductForm({ initial, onSubmit, onCancel, submitting }) {
  const [fields, setFields] = useState({
    name: initial?.name || '',
    price: initial?.price || '',
    category: initial?.category || categories[0].id,
    description: initial?.description || '',
    stock: initial?.stock ?? '',
  })
  const [imageFiles, setImageFiles] = useState([])
  const [replaceImages, setReplaceImages] = useState(false)
  const [error, setError] = useState('')

  function update(key, value) {
    setFields((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await onSubmit(fields, imageFiles, replaceImages)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save product')
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>Product name</label>
      <input className="field" value={fields.name} onChange={(e) => update('name', e.target.value)} required />

      <label>Price (KES)</label>
      <input
        className="field"
        type="number"
        min="0"
        value={fields.price}
        onChange={(e) => update('price', e.target.value)}
        required
      />

      <label>Category</label>
      <select className="field" value={fields.category} onChange={(e) => update('category', e.target.value)}>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <label>Stock</label>
      <input
        className="field"
        type="number"
        min="0"
        value={fields.stock}
        onChange={(e) => update('stock', e.target.value)}
        required
      />

      <label>Description</label>
      <textarea
        className="field"
        value={fields.description}
        onChange={(e) => update('description', e.target.value)}
      />

      <label>{initial ? 'Add / replace images' : 'Images'}</label>
      <input
        className="field"
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setImageFiles(Array.from(e.target.files))}
      />

      {initial && imageFiles.length > 0 && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, textTransform: 'none', fontSize: 11 }}>
          <input
            type="checkbox"
            checked={replaceImages}
            onChange={(e) => setReplaceImages(e.target.checked)}
          />
          Replace existing images instead of adding to them
        </label>
      )}

      {error && <p className="field-error">{error}</p>}

      <div className="actions">
        <button className="goldbtn" type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add product'}
        </button>
        {onCancel && (
          <button className="ghostbtn" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default ProductForm
