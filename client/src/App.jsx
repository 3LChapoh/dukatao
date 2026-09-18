import { useEffect, useState } from 'react'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { FavouritesProvider } from './context/FavouritesContext'
import { ContactProvider } from './context/ContactContext'
import { productsApi, configApi } from './api'

import SiteChrome from './components/SiteChrome'
import Hero from './components/Hero'
import CategoryStrip from './components/CategoryStrip'
import FeaturedProducts from './components/FeaturedProducts'
import AdminPortal from './pages/AdminPortal'
import AllProductsPage from './pages/AllProductsPage'

function HomePage() {
  const [stats, setStats] = useState({ products: '—' })
  const [heroImages, setHeroImages] = useState([])

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

  // Category strip sends customers straight to the full products page,
  // pre-filtered to the category they tapped.
  function goToCategory(categoryId) {
    window.location.hash = `#/products?category=${encodeURIComponent(categoryId)}`
  }

  return (
    <SiteChrome>
      <Hero stats={stats} heroImages={heroImages} />
      <CategoryStrip onSelect={goToCategory} />
      <FeaturedProducts />
    </SiteChrome>
  )
}

// Minimal hash router: '#/admin' loads its own portal with its own auth
// session; '#/products' is the full catalog page. Anything else is home.
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
      {route.startsWith('#/admin') ? (
        <AdminPortal />
      ) : (
        <AuthProvider>
          <FavouritesProvider>
            <CartProvider>
              <ContactProvider>
                {route.startsWith('#/products') ? <AllProductsPage /> : <HomePage />}
              </ContactProvider>
            </CartProvider>
          </FavouritesProvider>
        </AuthProvider>
      )}
    </ToastProvider>
  )
}
