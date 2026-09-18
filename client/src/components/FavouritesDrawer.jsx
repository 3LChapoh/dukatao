import { useEffect, useState } from 'react'
import { imageUrl, productsApi } from '../api'
import { money } from '../data/categories'
import { useFavourites } from '../context/FavouritesContext'
import { useCart } from '../context/CartContext'

export default function FavouritesDrawer({ onClose }) {
  const { ids, toggle } = useFavourites()
  const { addItem } = useCart()
  const [products, setProducts] = useState([])

  useEffect(() => {
    productsApi.list().then(setProducts).catch(() => {})
  }, [])

  const favProducts = products.filter((p) => ids.includes(p._id))

  return (
    <>
      <div className="drawer-head">
        <h2>Your favourites</h2>
        <button className="close" onClick={onClose}>
          ×
        </button>
      </div>
      {favProducts.length ? (
        favProducts.map((p) => {
          const out = p.stock <= 0
          return (
            <div className="fav-row" key={p._id}>
              <img src={imageUrl(p.images?.[0]?.url) || undefined} alt="" />
              <div>
                <b className="serif">{p.name}</b>
                <b className="mono" style={{ fontSize: 11 }}>
                  {money(p.price)}
                </b>
              </div>
              <div className="fav-actions">
                <button className={`tiny${out ? '' : ' ok'}`} disabled={out} onClick={() => addItem(p)}>
                  {out ? 'Out of stock' : 'Add to bag'}
                </button>
                <button className="tiny danger" onClick={() => toggle(p._id)}>
                  Remove
                </button>
              </div>
            </div>
          )
        })
      ) : (
        <div className="notice">Tap the heart on any fragrance to save it here.</div>
      )}
    </>
  )
}
