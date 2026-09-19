import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useFavourites } from '../context/FavouritesContext'
import { useScrollNav } from '../hooks/useScrollNav'

const RADIUS = 22
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function BottomNav({ theme, onToggleTheme, onOpenCart, onOpenAccount, onOpenFavourites }) {
  const { count } = useCart()
  const { ids: favourites } = useFavourites()
  const { scrolled, progress } = useScrollNav()
  const [themeSpin, setThemeSpin] = useState(false)

  function handleThemeToggle() {
    onToggleTheme()
    setThemeSpin(true)
    setTimeout(() => setThemeSpin(false), 500)
  }

  const dashoffset = CIRCUMFERENCE * (1 - progress)
  // Pops up once the page is scrolled and stays put (sticky) regardless of
  // scroll direction — independent of the top nav's own fade-on-scroll.
  const showBottomNav = scrolled

  // The home button always lands on the homepage, no matter which page
  // (products, admin, etc.) it's tapped from — not just when already home.
  function goHome() {
    const onHome = !window.location.hash || window.location.hash === '#' || window.location.hash === '#home'
    if (onHome) {
      document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    window.location.hash = ''
    // Give React a couple of frames to switch routes and mount the home
    // page before trying to scroll to its hero section.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })
      })
    })
  }

  return (
    <>
      <nav className={`bottom-nav${showBottomNav ? ' show' : ''}`} aria-label="Mobile">
        <button onClick={goHome} aria-label="Go to homepage">🏠</button>
        <button className={themeSpin ? 'spin-tap' : ''} onClick={handleThemeToggle} aria-label="Toggle theme">
          {theme === 'light' ? '☾' : '☼'}
        </button>
        <button onClick={onOpenFavourites}>
          ♡ <span className="cart-count">{favourites.length}</span>
        </button>
        <button onClick={onOpenAccount}>👤</button>
        <button onClick={onOpenCart}>
          🛍 <span className="cart-count">{count}</span>
        </button>
      </nav>
      <button
        className={`back-to-top${scrolled ? ' show' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        <svg viewBox="0 0 52 52" width="52" height="52">
          <circle className="btt-track" cx="26" cy="26" r={RADIUS} />
          <circle
            className="btt-progress"
            cx="26"
            cy="26"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashoffset}
          />
        </svg>
        <span className="btt-arrow">↑</span>
      </button>
    </>
  )
}
