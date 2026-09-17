import { useEffect, useMemo, useState } from 'react'
import { productsApi } from '../api'
import { categories } from '../data/categories'
import { useFavourites } from '../context/FavouritesContext'
import ProductCard from './ProductCard'

const PAGE_SIZES = [8, 16, 24, 32]

export default function ProductGrid({ initialCategory, onCategoryConsumed }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('featured')
  const [pageSize, setPageSize] = useState(8)
  const [page, setPage] = useState(1)

  const { ids: favourites, toggle: toggleFavourite } = useFavourites()

  useEffect(() => {
    if (!initialCategory) return
    setCategory(initialCategory)
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })
    onCategoryConsumed?.()
  }, [initialCategory, onCategoryConsumed])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    productsApi
      .list()
      .then((data) => {
        if (!cancelled) setProducts(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = products.filter(
      (p) =>
        (!q || `${p.name} ${p.description || ''}`.toLowerCase().includes(q)) &&
        (!category || (p.category || '').toLowerCase().trim() === category)
    )
    if (sort === 'low') list = [...list].sort((a, b) => a.price - b.price)
    else if (sort === 'high') list = [...list].sort((a, b) => b.price - a.price)
    else if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [products, search, category, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  return (
    <section id="collection" className="wrap reveal in">
      <a
        href="#home"
        className="muted"
        style={{ fontSize: 12, display: 'inline-block', marginBottom: 12 }}
        onClick={(e) => {
          e.preventDefault()
          window.location.hash = ''
        }}
      >
        ← Back to home
      </a>
      <div className="section-head">
        <div>
          <div className="eyebrow">All products</div>
          <h2>Browse everything</h2>
        </div>
        <span className="muted" style={{ fontSize: 11 }}>
          {filtered.length} products
        </span>
      </div>

      <div className="controls">
        <input
          className="field search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
        <select
          className="field"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value)
            setPage(1)
          }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option value={c.id} key={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select className="field" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="featured">Featured</option>
          <option value="low">Price: low to high</option>
          <option value="high">Price: high to low</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {loading && <div className="notice">Loading the collection…</div>}
      {!loading && error && <div className="notice">Could not load products: {error}</div>}

      {!loading && !error && (
        <>
          <div className="page-size-row">
            <span className="muted">Products per page</span>
            <div className="page-sizes">
              {PAGE_SIZES.map((size) => (
                <button
                  key={size}
                  className={`page-size${size === pageSize ? ' active' : ''}`}
                  onClick={() => {
                    setPageSize(size)
                    setPage(1)
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="products">
            {visible.length ? (
              visible.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  isFavourite={favourites.includes(p._id)}
                  onToggleFavourite={toggleFavourite}
                />
              ))
            ) : (
              <div className="notice" style={{ gridColumn: '1/-1' }}>
                No product matched your search. Try another term or category.
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button className="ghostbtn" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
                ← Prev
              </button>
              <span className="page-info">
                Page {safePage} of {totalPages}
              </span>
              <button className="ghostbtn" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
