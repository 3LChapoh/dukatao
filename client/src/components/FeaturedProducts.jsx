import { useEffect, useState } from 'react'
import { productsApi } from '../api'
import { useFavourites } from '../context/FavouritesContext'
import ProductCard from './ProductCard'

const PREVIEW_SIZES = [6, 12, 16, 20]
const DEFAULT_SIZE = 12

export default function FeaturedProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [visibleCount, setVisibleCount] = useState(DEFAULT_SIZE)

  const { ids: favourites, toggle: toggleFavourite } = useFavourites()

  useEffect(() => {
    let cancelled = false
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

  function goToAllProducts() {
    window.location.hash = '#/products'
  }

  const visible = products.slice(0, visibleCount)

  return (
    <section id="collection" className="wrap reveal in">
      <div className="section-head">
        <div>
          <div className="eyebrow">Curated for your home</div>
          <h2>The collection</h2>
        </div>
        <span className="muted" style={{ fontSize: 11 }}>
          {products.length} products
        </span>
      </div>

      {loading && <div className="notice">Loading the collection…</div>}
      {!loading && error && <div className="notice">Could not load products: {error}</div>}

      {!loading && !error && (
        <>
          <div className="page-size-row">
            <span className="muted">Show</span>
            <div className="page-sizes">
              {PREVIEW_SIZES.map((size) => (
                <button
                  key={size}
                  className={`page-size${size === visibleCount ? ' active' : ''}`}
                  onClick={() => setVisibleCount(size)}
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
                No products yet — check back soon.
              </div>
            )}
          </div>

          {products.length > 0 && (
            <div className="actions" style={{ justifyContent: 'center', marginTop: 24 }}>
              <button className="goldbtn" onClick={goToAllProducts}>
                View all products →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
