import { useCart } from '../context/CartContext'
import { useFavourites } from '../context/FavouritesContext'
import { useScrollNav } from '../hooks/useScrollNav'

const RADIUS = 22
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function BottomNav({ theme, onToggleTheme, onOpenCart, onOpenAccount, onOpenFavourites }) {
  const { count } = useCart()
  const { ids: favourites } = useFavourites()
  const { scrolled, progress } = useScrollNav()

  const dashoffset = CIRCUMFERENCE * (1 - progress)
  // Pops up once the page is scrolled and stays put (sticky) regardless of
  // scroll direction — independent of the top nav's own fade-on-scroll.
  const showBottomNav = scrolled

  return (
    <>
      <nav className={`bottom-nav${showBottomNav ? ' show' : ''}`} aria-label="Mobile">
        <button onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })}>🏠</button>
        <button onClick={onToggleTheme}>{theme === 'light' ? '☾' : '☼'}</button>
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
