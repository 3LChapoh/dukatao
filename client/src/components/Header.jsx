import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Header({ theme, onToggleTheme, onOpenCart, onOpenAccount }) {
  const { user } = useAuth()
  const { count } = useCart()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 80)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}`}>
      <div className="wrap nav-inner">
        <a className="logo" href="#home">
          Duka<span>Tao</span>
        </a>
        <nav className="navlinks" aria-label="Primary">
          <a href="#collection">Collection</a>
          <a href="#categories">Categories</a>
          <button type="button" className="navlink-btn" onClick={onOpenAccount}>Orders</button>
        </nav>
        <div className="nav-actions">
          <button className="iconbtn" onClick={onToggleTheme} title="Toggle theme" aria-label="Toggle light or dark theme">
            {theme === 'light' ? '☾' : '☼'}
          </button>
          <button className="iconbtn" onClick={onOpenAccount} aria-label="Account and sign in">
            {user ? '👤' : '♙'}
          </button>
          <button className="iconbtn" onClick={onOpenCart} aria-label="Open shopping bag">
            🛍 <span className="cart-count" aria-live="polite">{count}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
