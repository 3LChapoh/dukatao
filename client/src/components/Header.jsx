import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useScrollNav } from '../hooks/useScrollNav'

export default function Header({ theme, onToggleTheme, onOpenCart, onOpenAccount }) {
  const { user } = useAuth()
  const { count } = useCart()
  const { scrolled, hidden } = useScrollNav()
  const [themeSpin, setThemeSpin] = useState(false)

  function handleThemeToggle() {
    onToggleTheme()
    setThemeSpin(true)
    setTimeout(() => setThemeSpin(false), 500)
  }

  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}${hidden ? ' nav-hidden' : ''}`}>
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
          <button
            className={`iconbtn${themeSpin ? ' spin-tap' : ''}`}
            onClick={handleThemeToggle}
            title="Toggle theme"
            aria-label="Toggle light or dark theme"
          >
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
