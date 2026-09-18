import { useEffect, useState } from 'react'
import { statsApi } from '../../api'
import { money } from '../../utils'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useToast } from '../../context/ToastContext'

function StatCard({ label, value, accent }) {
  return (
    <div className="mini" style={{ textAlign: 'center' }}>
      <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </div>
      <div className="serif" style={{ fontSize: 26, marginTop: 4, color: accent }}>
        {value}
      </div>
    </div>
  )
}

export default function AdminOverview({ onGoToOrders, onGoToProducts }) {
  const { token } = useAdminAuth()
  const showToast = useToast()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    statsApi
      .get(token)
      .then(setStats)
      .catch((err) => showToast(err.message || 'Could not load stats', true))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <div className="notice">Loading overview…</div>
  if (!stats) return <div className="notice">Could not load stats.</div>

  return (
    <div>
      <div className="mini-grid" style={{ marginBottom: 20 }}>
        <StatCard label="Total orders" value={stats.totalOrders} />
        <StatCard label="Pending" value={stats.ordersByStatus.Pending} accent="#c9a24b" />
        <StatCard label="Processing" value={stats.ordersByStatus.Processing} accent="#60a5fa" />
        <StatCard label="Completed revenue" value={money(stats.completedRevenue)} accent="#34d399" />
      </div>

      <div className="mini-grid" style={{ marginBottom: 20 }}>
        <StatCard label="Products" value={stats.totalProducts} />
        <StatCard
          label="Low stock"
          value={stats.lowStockProducts.length}
          accent={stats.lowStockProducts.length ? '#c9a24b' : undefined}
        />
        <StatCard label="Out of stock" value={stats.outOfStockCount} accent={stats.outOfStockCount ? '#f87171' : undefined} />
        <StatCard label="Cancelled" value={stats.ordersByStatus.Cancelled} />
      </div>

      {stats.lowStockProducts.length > 0 && (
        <>
          <h3 style={{ fontSize: 13, margin: '16px 0 8px' }}>
            Running low (≤ {stats.lowStockThreshold} left)
          </h3>
          <div className="mini-grid" style={{ marginBottom: 20 }}>
            {stats.lowStockProducts.map((p) => (
              <div className="mini" key={p._id}>
                <strong>{p.name}</strong>
                <br />
                <span className="muted" style={{ color: '#c9a24b' }}>
                  {p.stock} left
                </span>
              </div>
            ))}
          </div>
          <div className="actions" style={{ marginBottom: 20 }}>
            <button className="ghostbtn tiny" onClick={onGoToProducts}>
              Go to Products →
            </button>
          </div>
        </>
      )}

      {stats.ordersByStatus.Pending > 0 && (
        <div className="notice" style={{ marginBottom: 12 }}>
          {stats.ordersByStatus.Pending} order(s) waiting to be processed.{' '}
          <button className="navlink-btn" onClick={onGoToOrders}>
            Review orders →
          </button>
        </div>
      )}
    </div>
  )
}
