import { useEffect, useState } from 'react'
import { ordersApi } from '../api'
import { money } from '../data/categories'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import PasswordField from './PasswordField'

const PHONE_RE = /^(?:\+254|254|0)7\d{8}$/

const STATUS_STYLES = {
  Pending: { bg: '#c9a24b22', color: '#c9a24b' },
  Processing: { bg: '#3b82f622', color: '#60a5fa' },
  Completed: { bg: '#1f6f5422', color: '#34d399' },
  Cancelled: { bg: '#ef444422', color: '#f87171' },
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || { bg: '#8883', color: '#999' }
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 600,
        background: style.bg,
        color: style.color,
      }}
    >
      {status}
    </span>
  )
}

export default function AccountDrawer({ onClose, refreshKey }) {
  const { user, token, login, register, logout, updateProfile } = useAuth()
  const showToast = useToast()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', address: '' })
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', address: '' })
  const [savingProfile, setSavingProfile] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  useEffect(() => {
    if (!user) return
    setProfileForm({ name: user.name || '', phone: user.phone || '', address: user.address || '' })
  }, [user])

  useEffect(() => {
    if (!user) return
    setOrdersLoading(true)
    ordersApi
      .mine(token)
      .then(setOrders)
      .catch((err) => showToast(err.message, true))
      .finally(() => setOrdersLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, refreshKey])

  async function submit(e) {
    e.preventDefault()

    if (mode === 'register') {
      if (form.password !== form.confirmPassword) {
        showToast('Passwords do not match', true)
        return
      }
      if (form.phone && !PHONE_RE.test(form.phone.replace(/\s/g, ''))) {
        showToast('Enter a valid Kenyan phone number, e.g. 07XX XXX XXX', true)
        return
      }
    }

    setBusy(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        const { confirmPassword, ...payload } = form
        await register(payload)
      }
      showToast(mode === 'login' ? 'Welcome back' : 'Account created')
    } catch (err) {
      showToast(err.message || 'Something went wrong', true)
    } finally {
      setBusy(false)
    }
  }

  async function saveProfile(e) {
    e.preventDefault()
    if (profileForm.phone && !PHONE_RE.test(profileForm.phone.replace(/\s/g, ''))) {
      showToast('Enter a valid Kenyan phone number, e.g. 07XX XXX XXX', true)
      return
    }
    setSavingProfile(true)
    try {
      await updateProfile(profileForm)
      showToast('Profile updated')
      setEditing(false)
    } catch (err) {
      showToast(err.message || 'Could not update profile', true)
    } finally {
      setSavingProfile(false)
    }
  }

  async function cancelOrder(id) {
    try {
      await ordersApi.cancel(id, token)
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status: 'Cancelled' } : o)))
      showToast('Order cancelled')
    } catch (err) {
      showToast(err.message || 'Could not cancel order', true)
    }
  }

  if (!user) {
    return (
      <>
        <div className="drawer-head">
          <h2>{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
          <button className="close" onClick={onClose}>
            ×
          </button>
        </div>
        <form className="form" onSubmit={submit}>
          {mode === 'register' && (
            <label>
              Name
              <input className="field" required value={form.name} onChange={(e) => update('name', e.target.value)} />
            </label>
          )}
          <label>
            Email
            <input className="field" type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} />
          </label>
          <label>
            Password
            <PasswordField value={form.password} onChange={(e) => update('password', e.target.value)} required />
          </label>
          {mode === 'register' && (
            <>
              <label>
                Confirm password
                <PasswordField value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} required />
              </label>
              <label>
                Phone
                <input className="field" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="07XX XXX XXX" />
              </label>
              <label>
                Delivery address
                <input className="field" value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Westlands, Nairobi" />
              </label>
            </>
          )}
          <button className="goldbtn" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <button className="ghostbtn" style={{ marginTop: 12, width: '100%' }} onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </>
    )
  }

  return (
    <>
      <div className="drawer-head">
        <h2>Your account</h2>
        <button className="close" onClick={onClose}>
          ×
        </button>
      </div>

      {!editing ? (
        <div className="notice">
          Signed in as <b>{user.name}</b> ({user.email})
          {user.phone && <><br />{user.phone}</>}
          {user.address && <><br />{user.address}</>}
          <div style={{ marginTop: 8 }}>
            <button className="ghostbtn tiny" onClick={() => setEditing(true)}>
              Edit profile
            </button>
          </div>
        </div>
      ) : (
        <form className="form" onSubmit={saveProfile}>
          <label>
            Name
            <input className="field" required value={profileForm.name} onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} />
          </label>
          <label>
            Phone
            <input className="field" value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} placeholder="07XX XXX XXX" />
          </label>
          <label>
            Delivery address
            <input className="field" value={profileForm.address} onChange={(e) => setProfileForm((f) => ({ ...f, address: e.target.value }))} placeholder="Westlands, Nairobi" />
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="goldbtn" disabled={savingProfile} style={{ flex: 1 }}>
              {savingProfile ? 'Saving…' : 'Save changes'}
            </button>
            <button type="button" className="ghostbtn" onClick={() => setEditing(false)} style={{ flex: 1 }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <h3 style={{ fontSize: 13, margin: '16px 0 8px' }}>Orders</h3>
      {ordersLoading && <div className="notice">Loading your orders…</div>}
      {!ordersLoading && !orders.length && <div className="notice">No orders yet.</div>}
      {orders.map((o) => (
        <div className="mini" key={o._id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>{o._id.slice(-7).toUpperCase()}</strong>
            <StatusBadge status={o.status} />
          </div>
          <span className="muted">{new Date(o.createdAt).toLocaleDateString()}</span>
          <br />
          <b className="mono">{money(o.total)}</b>
          <br />
          <small>
            {o.deliveryLocation} · {o.paymentMethod}
          </small>
          {o.status === 'Pending' && (
            <div className="actions" style={{ marginTop: 6 }}>
              <button className="tiny danger" onClick={() => cancelOrder(o._id)}>
                Cancel order
              </button>
            </div>
          )}
        </div>
      ))}
      <button className="ghostbtn" style={{ marginTop: 16, width: '100%' }} onClick={logout}>
        Sign out
      </button>
    </>
  )
}
