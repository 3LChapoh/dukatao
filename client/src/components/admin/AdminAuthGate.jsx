import { useState } from 'react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useToast } from '../../context/ToastContext'
import PasswordField from '../PasswordField'

export default function AdminAuthGate() {
  const { login } = useAdminAuth()
  const showToast = useToast()
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', securityKey: '' })

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await login(form.email, form.password, form.securityKey)
    } catch (err) {
      showToast(err.message || 'Sign in failed', true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="wrap" style={{ maxWidth: 380, paddingTop: 60 }}>
      <div className="eyebrow">Admin</div>
      <h2 className="serif" style={{ margin: '6px 0 16px' }}>
        Admin sign in
      </h2>
      <form className="form" onSubmit={submit}>
        <label>
          Email
          <input className="field" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </label>
        <label>
          Password
          <PasswordField value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
        </label>
        <label>
          Security Key
          <PasswordField value={form.securityKey} onChange={(e) => setForm((f) => ({ ...f, securityKey: e.target.value }))} required />
        </label>
        <button className="goldbtn" disabled={busy}>
          {busy ? 'Please wait…' : 'Sign in'}
        </button>
      </form>
      <p className="muted" style={{ fontSize: 11, marginTop: 12 }}>
        Admin accounts are created with the <code>npm run seed:admin</code> script on the server, not
        through this form.
      </p>
    </section>
  )
}
