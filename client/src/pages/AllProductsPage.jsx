import { useState } from 'react'
import SiteChrome from '../components/SiteChrome'
import ProductGrid from '../components/ProductGrid'

// Reads an optional ?category=<id> off the current hash (e.g. '#/products?category=abc123'),
// set when a customer taps a category on the home page and is sent straight here.
function categoryFromHash() {
  const [, query] = window.location.hash.split('?')
  if (!query) return null
  return new URLSearchParams(query).get('category')
}

export default function AllProductsPage() {
  const [initialCategory, setInitialCategory] = useState(() => categoryFromHash())

  return (
    <SiteChrome>
      <ProductGrid initialCategory={initialCategory} onCategoryConsumed={() => setInitialCategory(null)} />
    </SiteChrome>
  )
}
