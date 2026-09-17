import { useEffect, useState } from 'react'
import { productsApi } from '../api'
import { useFavourites } from '../context/FavouritesContext'
import ProductCard from './ProductCard'

export default function FeaturedProducts({ limit = 12, onMore }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { ids: favourites, toggle: toggleFavourite } = useFavourites()

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

  const visible = products.slice(0, limit)

  return (
    <section id="collection" className="wrap reveal in">
      <div className="section-head">
        <div>
          <div className="eyebrow">Household essentials</div>
          <h2>Featured products</h2>
        </div>
        <span className="muted" style={{ fontSize: 11 }}>
          {products.length} products
        </span>
      </div>

      {loading && <div className="notice">Loading products…</div>}
      {!loading && error && <div className="notice">Could not load products: {error}</div>}

      {!loading && !error && (
        <>
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
                No products yet — check back soon.
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button className="goldbtn" onClick={onMore}>
              More products
            </button>
          </div>
        </>
      )}
    </section>
  )
}
