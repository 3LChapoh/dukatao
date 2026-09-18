import { useEffect, useState } from 'react'
import Header from './Header'
import Footer from './Footer'
import BottomNav from './BottomNav'
import DrawerOverlay from './DrawerOverlay'
import CartDrawer from './CartDrawer'
import AccountDrawer from './AccountDrawer'
import FavouritesDrawer from './FavouritesDrawer'

export default function SiteChrome({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('dukatao_theme') || 'dark')
  const [drawer, setDrawer] = useState(null) // 'cart' | 'account' | 'favourites' | null
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0)

  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light')
    localStorage.setItem('dukatao_theme', theme)
  }, [theme])

  function closeDrawer() {
    setDrawer(null)
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        onOpenCart={() => setDrawer('cart')}
        onOpenAccount={() => setDrawer('account')}
      />

      <main id="main-content">{children}</main>

      <Footer onOpenAccount={() => setDrawer('account')} />

      <BottomNav
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        onOpenCart={() => setDrawer('cart')}
        onOpenAccount={() => setDrawer('account')}
        onOpenFavourites={() => setDrawer('favourites')}
      />

      <DrawerOverlay open={!!drawer} onClose={closeDrawer}>
        {drawer === 'cart' && (
          <CartDrawer onClose={closeDrawer} onOrdersUpdated={() => setOrdersRefreshKey((k) => k + 1)} />
        )}
        {drawer === 'account' && <AccountDrawer onClose={closeDrawer} refreshKey={ordersRefreshKey} />}
        {drawer === 'favourites' && <FavouritesDrawer onClose={closeDrawer} />}
      </DrawerOverlay>
    </>
  )
}
