import { imageUrl } from '../api'
import { money } from '../utils'
import { useCart } from '../context/CartContext'

const DEFAULT_IMG =
  'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&h=1000&q=80&auto=format&fit=crop'

function stockLabel(stock) {
  if (stock <= 0) return 'Out of stock'
  if (stock <= 4) return 'Low stock'
  return 'In stock'
}

export default function ProductCard({ product, isFavourite, onToggleFavourite }) {
  const { addItem } = useCart()
  const cat = product.category || { name: 'Uncategorized', color: '#888' }
  const out = product.stock <= 0
  const img = imageUrl(product.images?.[0]?.url) || DEFAULT_IMG
  const altImg = imageUrl(product.images?.[1]?.url)

  return (
    <article className="product" style={{ '--accent': cat.color }}>
      <div className="p-img">
        <img src={img} alt={product.name} loading="lazy" />
        {altImg && <img className="alt" src={altImg} alt="" loading="lazy" />}
        <span className="badge">{cat.name}</span>
        <span className="stock">{stockLabel(product.stock)}</span>
        <button
          className={`fav-btn${isFavourite ? ' active' : ''}`}
          onClick={() => onToggleFavourite(product._id)}
          aria-pressed={isFavourite}
          aria-label={isFavourite ? `Remove ${product.name} from favourites` : `Add ${product.name} to favourites`}
        >
          {isFavourite ? '♥' : '♡'}
        </button>
      </div>
      <div className="p-body">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="price">{money(product.price)}</div>
        <button
          className="add"
          disabled={out}
          onClick={() => addItem(product)}
          aria-label={out ? `${product.name} is out of stock` : `Add ${product.name} to bag`}
        >
          {out ? 'Out of stock' : 'Add to bag'}
        </button>
      </div>
    </article>
  )
}
