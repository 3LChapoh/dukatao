import { useEffect, useState } from 'react'
import { ordersApi } from '../../api'
import { money } from '../../data/categories'
import { useVendorAuth } from '../../context/VendorAuthContext'
import { useToast } from '../../context/ToastContext'

const STATUSES = ['Pending', 'Processing', 'Completed', 'Cancelled']

export default function VendorOrders() {
  const { token, vendor } = useVendorAuth()
  const showToast = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  function reload() {
    setLoading(true)
    ordersApi
      .vendorOrders(token)
      .then(setOrders)
      .catch((err) => showToast(err.message, true))
      .finally(() => setLoading(false))
  }

  useEffect(reload, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function updateStatus(id, status) {
    try {
      await ordersApi.updateStatus(id, status, token)
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)))
      showToast('Order updated')
    } catch (err) {
      showToast(err.message || 'Could not update order', true)
    }
  }

  if (loading) return <div className="notice">Loading orders…</div>
  if (!orders.length) return <div className="notice">No orders for {vendor.boutiqueName} yet.</div>

  return (
    <div className="mini-grid">
      {orders.map((o) => (
        <div className="mini" key={o._id}>
          <strong>{o._id.slice(-7).toUpperCase()}</strong>
          <span className="muted"> · {new Date(o.createdAt).toLocaleDateString()}</span>
          <br />
          {o.items
            .filter((i) => i.vendor === vendor.boutiqueName)
            .map((i) => (
              <div key={i.product} className="muted" style={{ fontSize: 11 }}>
                {i.qty} × {i.name}
              </div>
            ))}
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
  )
}
