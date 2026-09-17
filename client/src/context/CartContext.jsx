import { createContext, useContext, useEffect, useState } from 'react'
import { useToast } from './ToastContext'

const CartContext = createContext(null)
const CART_KEY = 'rc_cart'

export function CartProvider({ children }) {
  const showToast = useToast()
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  function addItem(product) {
    if (product.stock <= 0) return showToast('Sorry, that item is out of stock', true)

    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id)
      if (existing) {
        if (existing.qty >= product.stock) {
          showToast(`Only ${product.stock} left in stock`, true)
          return prev
        }
        return prev.map((i) => (i.productId === product._id ? { ...i, qty: i.qty + 1 } : i))
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          vendor: product.vendor,
          price: product.price,
          image: product.images?.[0]?.url,
          stock: product.stock,
          qty: 1,
        },
      ]
    })
    showToast('Added to your bag')
  }

  function changeQty(productId, delta) {
    setItems((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    )
  }

  function removeItem(productId) {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  function clear() {
    setItems([])
  }

  const count = items.reduce((n, i) => n + i.qty, 0)
  const total = items.reduce((n, i) => n + i.price * i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, changeQty, removeItem, clear, count, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
