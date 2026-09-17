import { useState } from 'react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import PasswordField from '../PasswordField'

export default function AdminAuthGate({ children }) {
  const { user, loading, login } = useAdminAuth()

  const [form, setForm] = useState({
    username: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="admin-auth-loading">
        Checking admin session...
      </div>
    )
  }

  if (user) {
    return children
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(form.username, form.password)
    } catch (err) {
      setError(
        err?.message ||
          err?.response?.data?.message ||
          'Invalid username or password'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-auth-gate">
      <form onSubmit={handleSubmit} className="admin-login-form">
        <h1>DukaTao Admin</h1>

        <p>
          Sign in to manage your shop.
        </p>

        <label>
          Username
          <input
            type="text"
            value={form.username}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                username: e.target.value,
              }))
            }
            placeholder="Enter admin username"
            autoComplete="username"
            required
          />
        </label>

        <label>
          Password
          <PasswordField
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                password: e.target.value,
              }))
            }
            placeholder="Enter admin password"
            autoComplete="current-password"
            required
          />
        </label>

        {error && (
          <div className="admin-login-error">
            {error}
          </div>
        )}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
