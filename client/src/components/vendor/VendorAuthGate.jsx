import { useState } from 'react'
import { useVendorAuth } from '../../context/VendorAuthContext'
import { useToast } from '../../context/ToastContext'
import PasswordField from '../PasswordField'

export default function VendorAuthGate() {
  const { login } = useVendorAuth()
  const showToast = useToast()
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await login(form.email, form.password)
    } catch (err) {
      showToast(err.message || 'Something went wrong', true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="wrap" style={{ maxWidth: 420, paddingTop: 60 }}>
      <div className="eyebrow">Vendor portal</div>
      <h2 className="serif" style={{ margin: '6px 0 16px' }}>
        Vendor sign in
      </h2>
      <form className="form" onSubmit={submit}>
        <label>
          Email
          <input className="field" type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} />
        </label>
        <label>
          Password
          <PasswordField value={form.password} onChange={(e) => update('password', e.target.value)} required />
        </label>
        <button className="goldbtn" disabled={busy}>
          {busy ? 'Please wait…' : 'Sign in'}
        </button>
      </form>
    </section>
  )
}
