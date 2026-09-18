import { useState } from 'react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useToast } from '../../context/ToastContext'
import PasswordField from '../PasswordField'

const MODES = { LOGIN: 'login', SIGNUP: 'signup', RESET: 'reset' }

export default function AdminAuthGate() {
  const { login, signup, resetPassword } = useAdminAuth()
  const showToast = useToast()
  const [mode, setMode] = useState(MODES.LOGIN)
  const [busy, setBusy] = useState(false)

  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [signupForm, setSignupForm] = useState({ name: '', username: '', password: '' })
  const [resetForm, setResetForm] = useState({ username: '', recoveryCode: '', newPassword: '' })

  // Shown once, after a successful signup or reset — the code is never retrievable again.
  const [pendingCode, setPendingCode] = useState(null)

  async function submitLogin(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await login(loginForm.username, loginForm.password)
    } catch (err) {
      showToast(err.message || 'Sign in failed', true)
    } finally {
      setBusy(false)
    }
  }

  async function submitSignup(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const { recoveryCode } = await signup(signupForm.name, signupForm.username, signupForm.password)
      setPendingCode({ code: recoveryCode, next: MODES.LOGIN })
    } catch (err) {
      showToast(err.message || 'Sign up failed', true)
    } finally {
      setBusy(false)
    }
  }

  async function submitReset(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const newCode = await resetPassword(resetForm.username, resetForm.recoveryCode, resetForm.newPassword)
      setPendingCode({ code: newCode, next: MODES.LOGIN })
      showToast('Password reset — sign in with your new password')
    } catch (err) {
      showToast(err.message || 'Reset failed', true)
    } finally {
      setBusy(false)
    }
  }

  // Recovery-code acknowledgement screen — blocks until the admin confirms they saved it.
  if (pendingCode) {
    return (
      <section className="wrap" style={{ maxWidth: 380, paddingTop: 60 }}>
        <div className="eyebrow">Save this now</div>
        <h2 className="serif" style={{ margin: '6px 0 16px' }}>
          Your recovery code
        </h2>
        <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
          There's no email on file to send this to. Write it down or store it somewhere safe — it's the
          only way back into this account if you forget your password, and it will not be shown again.
        </p>
        <div
          className="mono"
          style={{
            fontSize: 20,
            letterSpacing: 1,
            padding: '14px 16px',
            border: '1px solid var(--line, #333)',
            borderRadius: 8,
            textAlign: 'center',
            marginBottom: 16,
          }}
        >
          {pendingCode.code}
        </div>
        <button
          className="goldbtn"
          onClick={() => {
            setMode(pendingCode.next)
            setPendingCode(null)
          }}
        >
          I've saved it — continue
        </button>
      </section>
    )
  }

  if (mode === MODES.SIGNUP) {
    return (
      <section className="wrap" style={{ maxWidth: 380, paddingTop: 60 }}>
        <div className="eyebrow">Admin</div>
        <h2 className="serif" style={{ margin: '6px 0 16px' }}>
          Create admin account
        </h2>
        <form className="form" onSubmit={submitSignup}>
          <label>
            Name
            <input className="field" required value={signupForm.name} onChange={(e) => setSignupForm((f) => ({ ...f, name: e.target.value }))} />
          </label>
          <label>
            Username
            <input className="field" required value={signupForm.username} onChange={(e) => setSignupForm((f) => ({ ...f, username: e.target.value }))} />
          </label>
          <label>
            Password
            <PasswordField value={signupForm.password} onChange={(e) => setSignupForm((f) => ({ ...f, password: e.target.value }))} required />
          </label>
          <button className="goldbtn" disabled={busy}>
            {busy ? 'Please wait…' : 'Create account'}
          </button>
        </form>
        <p className="muted" style={{ fontSize: 11, marginTop: 12 }}>
          Only 2 admin accounts are allowed for this shop.
        </p>
        <button className="navlink-btn" style={{ marginTop: 8 }} onClick={() => setMode(MODES.LOGIN)}>
          ← Back to sign in
        </button>
      </section>
    )
  }

  if (mode === MODES.RESET) {
    return (
      <section className="wrap" style={{ maxWidth: 380, paddingTop: 60 }}>
        <div className="eyebrow">Admin</div>
        <h2 className="serif" style={{ margin: '6px 0 16px' }}>
          Reset password
        </h2>
        <form className="form" onSubmit={submitReset}>
          <label>
            Username
            <input className="field" required value={resetForm.username} onChange={(e) => setResetForm((f) => ({ ...f, username: e.target.value }))} />
          </label>
          <label>
            Recovery code
            <input
              className="field"
              required
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={resetForm.recoveryCode}
              onChange={(e) => setResetForm((f) => ({ ...f, recoveryCode: e.target.value }))}
            />
          </label>
          <label>
            New password
            <PasswordField value={resetForm.newPassword} onChange={(e) => setResetForm((f) => ({ ...f, newPassword: e.target.value }))} required />
          </label>
          <button className="goldbtn" disabled={busy}>
            {busy ? 'Please wait…' : 'Reset password'}
          </button>
        </form>
        <button className="navlink-btn" style={{ marginTop: 8 }} onClick={() => setMode(MODES.LOGIN)}>
          ← Back to sign in
        </button>
      </section>
    )
  }

  return (
    <section className="wrap" style={{ maxWidth: 380, paddingTop: 60 }}>
      <div className="eyebrow">Admin</div>
      <h2 className="serif" style={{ margin: '6px 0 16px' }}>
        Admin sign in
      </h2>
      <form className="form" onSubmit={submitLogin}>
        <label>
          Username
          <input className="field" required value={loginForm.username} onChange={(e) => setLoginForm((f) => ({ ...f, username: e.target.value }))} />
        </label>
        <label>
          Password
          <PasswordField value={loginForm.password} onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))} required />
        </label>
        <button className="goldbtn" disabled={busy}>
          {busy ? 'Please wait…' : 'Sign in'}
        </button>
      </form>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
        <button className="navlink-btn" onClick={() => setMode(MODES.SIGNUP)}>
          Create account
        </button>
        <button className="navlink-btn" onClick={() => setMode(MODES.RESET)}>
          Forgot password?
        </button>
      </div>
    </section>
  )
}
