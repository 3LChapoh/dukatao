import { useEffect, useState } from 'react'
import { imageUrl } from '../api'
import { money } from '../utils'

const DEFAULT_IMG =
  'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&h=1000&q=80&auto=format&fit=crop'

export default function ProductDetailsModal({ product, isFavourite, onToggleFavourite, onAdd, onClose }) {
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  const images = product.images?.length ? product.images : []
  const cat = product.category || { name: 'Uncategorized', color: '#888' }
  const out = product.stock <= 0

  return (
    <div className="pd-overlay" onClick={onClose}>
      <div className="pd-modal" onClick={(e) => e.stopPropagation()} style={{ '--accent': cat.color }}>
        <button className="pd-close" onClick={onClose} aria-label="Close product details">
          ×
        </button>

        <div className="pd-gallery">
          <img src={imageUrl(images[activeImg]?.url) || DEFAULT_IMG} alt={product.name} />
          {images.length > 1 && (
            <div className="pd-thumbs">
              {images.map((img, i) => (
                <button
                  key={img.publicId || i}
                  className={`pd-thumb${i === activeImg ? ' active' : ''}`}
                  onClick={() => setActiveImg(i)}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={imageUrl(img.url) || DEFAULT_IMG} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pd-body">
          <span className="badge pd-badge">{cat.name}</span>
          <h2>{product.name}</h2>
          <p className="pd-desc">{product.description || 'No description added for this product yet.'}</p>

          <div className="pd-meta">
            <span className="price">{money(product.price)}</span>
            <span className={`pd-stock${out ? ' out' : ''}`}>
              {out ? 'Out of stock' : `${product.stock} in stock`}
            </span>
          </div>

          <div className="pd-actions">
            <button
              className="add"
              disabled={out}
              onClick={() => {
                onAdd()
                onClose()
              }}
              aria-label={out ? `${product.name} is out of stock` : `Add ${product.name} to bag`}
            >
              {out ? 'Out of stock' : 'Add to bag'}
            </button>
            <button
              className={`fav-btn pd-fav${isFavourite ? ' active' : ''}`}
              onClick={() => onToggleFavourite(product._id)}
              aria-pressed={isFavourite}
              aria-label={isFavourite ? `Remove ${product.name} from favourites` : `Add ${product.name} to favourites`}
            >
              {isFavourite ? '♥' : '♡'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
