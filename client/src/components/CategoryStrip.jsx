import { useEffect, useState } from 'react'
import { categoriesApi } from '../api'

export default function CategoryStrip({ onSelect }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    categoriesApi
      .list()
      .then((data) => {
        if (!cancelled) setCategories(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section id="categories" className="wrap reveal in">
      <div className="section-head">
        <div>
          <div className="eyebrow">Shop by category</div>
          <h2>Everything for the home</h2>
        </div>
        <span className="muted" style={{ fontSize: 11 }}>
          Swipe to explore →
        </span>
      </div>
      {loading && <div className="notice">Loading categories…</div>}
      {!loading && (
        <div className="cat-track">
          {categories.map((c, i) => (
            <button className="cat" style={{ '--accent': c.color }} key={c._id} onClick={() => onSelect(c._id)}>
              <span className="num">0{i + 1}</span>
              <b>{c.name}</b>
              <small>{c.description}</small>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
