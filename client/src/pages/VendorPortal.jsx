import { useState } from 'react'
import { VendorAuthProvider, useVendorAuth } from '../context/VendorAuthContext'
import VendorAuthGate from '../components/vendor/VendorAuthGate'
import VendorProducts from '../components/vendor/VendorProducts'
import VendorOrders from '../components/vendor/VendorOrders'

function Dashboard() {
  const { vendor, logout } = useVendorAuth()
  const [tab, setTab] = useState('products')

  return (
    <section className="wrap dash" style={{ paddingTop: 40 }}>
      <div className="section-head">
        <div>
          <div className="eyebrow">Boutique portal</div>
          <h2 className="serif">{vendor.boutiqueName}</h2>
        </div>
        <button className="ghostbtn" onClick={logout}>
          Sign out
        </button>
      </div>
      <div className="tabs" style={{ margin: '16px 0' }}>
        <button className={`tab${tab === 'products' ? ' active' : ''}`} onClick={() => setTab('products')}>
          Products
        </button>
        <button className={`tab${tab === 'orders' ? ' active' : ''}`} onClick={() => setTab('orders')}>
          Orders
        </button>
      </div>
      {tab === 'products' ? <VendorProducts /> : <VendorOrders />}
    </section>
  )
}

function VendorPortalInner() {
  const { token, vendor } = useVendorAuth()
  return token && vendor ? <Dashboard /> : <VendorAuthGate />
}

export default function VendorPortal() {
  return (
    <VendorAuthProvider>
      <VendorPortalInner />
    </VendorAuthProvider>
  )
}
