import { useEffect, useState } from 'react'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { FavouritesProvider } from './context/FavouritesContext'
import { ContactProvider } from './context/ContactContext'
import { productsApi, configApi } from './api'

import Header from './components/Header'
import Hero from './components/Hero'
import CategoryStrip from './components/CategoryStrip'
import FeaturedProducts from './components/FeaturedProducts'
import ProductGrid from './components/ProductGrid'
import Footer from './components/Footer'
import BottomNav from './components/BottomNav'
import DrawerOverlay from './components/DrawerOverlay'
import CartDrawer from './components/CartDrawer'
import AccountDrawer from './components/AccountDrawer'
import FavouritesDrawer from './components/FavouritesDrawer'
import VendorPortal from './pages/VendorPortal'
import AdminPortal from './pages/AdminPortal'

function AppShell() {
  // Always start in light mode, regardless of any previously saved preference.
  const [theme, setTheme] = useState('light')
  const [drawer, setDrawer] = useState(null) // 'cart' | 'account' | 'favourites' | null
  const [pendingCategory, setPendingCategory] = useState(null)
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0)
  const [stats, setStats] = useState({ products: '—' })
  const [heroImages, setHeroImages] = useState([])

  // Separate from the top-level '#/vendor' / '#/admin' router below: this just
  // toggles between the home page and the full "all products" page, both of
  // which share this same cart/favourites/account state.
  const [subRoute, setSubRoute] = useState(() => window.location.hash)
  useEffect(() => {
    function onHashChange() {
      setSubRoute(window.location.hash)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  const showAllProducts = subRoute.startsWith('#/products')

  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light')
    localStorage.setItem('rc_theme', theme)
  }, [theme])

  useEffect(() => {
    productsApi
      .list()
      .then((data) => {
        if (!Array.isArray(data)) return
        setStats({ products: data.length })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    configApi
      .get()
      .then((data) => {
        if (data && Array.isArray(data.heroImages)) setHeroImages(data.heroImages)
      })
      .catch(() => {})
  }, [])

  function closeDrawer() {
    setDrawer(null)
  }

  return (
    <>
      <a className="skip-link" href="#collection">
        Skip to collection
      </a>
      <Header
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        onOpenCart={() => setDrawer('cart')}
        onOpenAccount={() => setDrawer('account')}
      />

      <main>
        {showAllProducts ? (
          <ProductGrid initialCategory={pendingCategory} onCategoryConsumed={() => setPendingCategory(null)} />
        ) : (
          <>
            <Hero stats={stats} heroImages={heroImages} />
            <CategoryStrip
              onSelect={(id) => {
                setPendingCategory(id)
                window.location.hash = '#/products'
              }}
            />
            <FeaturedProducts limit={12} onMore={() => (window.location.hash = '#/products')} />
          </>
        )}
      </main>

      <Footer />

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

// Minimal hash router: '#/vendor' and '#/admin' load their own portals with
// their own auth sessions, entirely separate from the customer storefront below.
export default function App() {
  const [route, setRoute] = useState(() => window.location.hash)

  useEffect(() => {
    function onHashChange() {
      setRoute(window.location.hash)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <ToastProvider>
      {route.startsWith('#/vendor') ? (
        <VendorPortal />
      ) : route.startsWith('#/admin') ? (
        <AdminPortal />
      ) : (
        <AuthProvider>
          <FavouritesProvider>
            <CartProvider>
              <ContactProvider>
                <AppShell />
              </ContactProvider>
            </CartProvider>
          </FavouritesProvider>
        </AuthProvider>
      )}
    </ToastProvider>
  )
}
