import { useState } from 'react'
import { AdminAuthProvider, useAdminAuth } from '../context/AdminAuthContext'
import AdminAuthGate from '../components/admin/AdminAuthGate'
import AdminProducts from '../components/admin/AdminProducts'
import AdminOrders from '../components/admin/AdminOrders'
import AdminHero from '../components/admin/AdminHero'

function Dashboard() {
  const { user, logout } = useAdminAuth()
  const [tab, setTab] = useState('products')

  return (
    <section className="wrap dash" style={{ paddingTop: 40 }}>
      <div className="section-head">
        <div>
          <div className="eyebrow">Admin</div>
          <h2 className="serif">DukaTao control room</h2>
        </div>

        <button className="ghostbtn" onClick={logout}>
          Sign out ({user?.name || user?.username || 'Admin'})
        </button>
      </div>

      <div className="tabs" style={{ margin: '16px 0' }}>
        <button
          className={`tab${tab === 'products' ? ' active' : ''}`}
          onClick={() => setTab('products')}
        >
          Products
        </button>

        <button
          className={`tab${tab === 'orders' ? ' active' : ''}`}
          onClick={() => setTab('orders')}
        >
          Orders
        </button>

        <button
          className={`tab${tab === 'hero' ? ' active' : ''}`}
          onClick={() => setTab('hero')}
        >
          Hero Images
        </button>
      </div>

      {tab === 'products' && <AdminProducts />}
      {tab === 'orders' && <AdminOrders />}
      {tab === 'hero' && <AdminHero />}
    </section>
  )
}

function AdminPortalInner() {
  const { user, loading } = useAdminAuth()

  if (loading) {
    return (
      <div className="admin-auth-loading">
        Checking admin session...
      </div>
    )
  }

  return user ? <Dashboard /> : <AdminAuthGate />
}

export default function AdminPortal() {
  return (
    <AdminAuthProvider>
      <AdminPortalInner />
    </AdminAuthProvider>
  )
}
