import { useState } from 'react'
import { AdminAuthProvider, useAdminAuth } from '../context/AdminAuthContext'
import AdminAuthGate from '../components/admin/AdminAuthGate'
import AdminProducts from '../components/admin/AdminProducts'
import AdminOrders from '../components/admin/AdminOrders'
import AdminHero from '../components/admin/AdminHero'

function Dashboard() {
  const { admin, logout } = useAdminAuth()
  const [tab, setTab] = useState('products')

  return (
    <section className="wrap dash" style={{ paddingTop: 40 }}>
      <div className="section-head">
        <div>
          <div className="eyebrow">Admin</div>
          <h2 className="serif">Dukatao control room</h2>
        </div>
        <button className="ghostbtn" onClick={logout}>
          Sign out ({admin.name})
        </button>
      </div>
      <div className="tabs" style={{ margin: '16px 0' }}>
        <button className={`tab${tab === 'products' ? ' active' : ''}`} onClick={() => setTab('products')}>
          Products
        </button>
        <button className={`tab${tab === 'orders' ? ' active' : ''}`} onClick={() => setTab('orders')}>
          Orders
        </button>
        <button className={`tab${tab === 'hero' ? ' active' : ''}`} onClick={() => setTab('hero')}>
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
  const { token, admin } = useAdminAuth()
  return token && admin ? <Dashboard /> : <AdminAuthGate />
}

export default function AdminPortal() {
  return (
    <AdminAuthProvider>
      <AdminPortalInner />
    </AdminAuthProvider>
  )
}
