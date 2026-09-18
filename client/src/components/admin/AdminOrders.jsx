import { useEffect, useState } from 'react'
import { ordersApi } from '../../api'
import { money } from '../../utils'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useToast } from '../../context/ToastContext'

const STATUSES = ['Pending', 'Processing', 'Completed', 'Cancelled']

export default function AdminOrders() {
  const { token } = useAdminAuth()
  const showToast = useToast()
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  function reload() {
    setLoading(true)
    ordersApi
      .all(token, filter)
      .then(setOrders)
      .catch((err) => showToast(err.message, true))
      .finally(() => setLoading(false))
  }

  useEffect(reload, [filter]) // eslint-disable-line react-hooks/exhaustive-deps

  const q = search.trim().toLowerCase()
  const visibleOrders = q
    ? orders.filter((o) =>
        [o.customerName, o.customerPhone, o.customerEmail, o._id.slice(-7)]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q))
      )
    : orders

  async function updateStatus(id, status) {
    try {
      await ordersApi.updateStatus(id, status, token)
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)))
      showToast('Order updated')
    } catch (err) {
      showToast(err.message || 'Could not update order', true)
    }
  }

  return (
    <div>
      <div className="tabs" style={{ marginBottom: 14 }}>
        <button className={`tab${filter === '' ? ' active' : ''}`} onClick={() => setFilter('')}>
          All
        </button>
        {STATUSES.map((s) => (
          <button key={s} className={`tab${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
            {s}
          </button>
        ))}
      </div>
      <input
        className="field"
        style={{ marginBottom: 14 }}
        placeholder="Search by customer name, phone, email or order ID…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading && <div className="notice">Loading orders…</div>}
      {!loading && !visibleOrders.length && <div className="notice">No orders match this filter.</div>}
      <div className="mini-grid">
        {visibleOrders.map((o) => (
          <div className="mini" key={o._id}>
            <strong>{o._id.slice(-7).toUpperCase()}</strong>
            <span className="muted"> · {new Date(o.createdAt).toLocaleDateString()}</span>
            <br />
            <span className="muted">{o.items.map((i) => `${i.qty} × ${i.name}`).join(', ')}</span>
            <br />
            <b className="mono">{money(o.total)}</b>
            <br />
            <small>
              {o.customerName} · {o.customerPhone} · {o.deliveryLocation}
            </small>
            <div className="field" style={{ marginTop: 8 }}>
              <select value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
