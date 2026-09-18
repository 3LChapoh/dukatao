import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Header({ theme, onToggleTheme, onOpenCart, onOpenAccount }) {
  const { user } = useAuth()
  const { count } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY
      setScrolled(y > 80)
      // Fade the bar away while scrolling down past the fold, bring it back
      // as soon as the user scrolls up (or is near the top).
      setHidden(y > 140 && y > lastY.current)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
