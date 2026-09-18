import { createContext, useContext, useState } from 'react'
import { usersApi } from '../api'

const AdminAuthContext = createContext(null)
const TOKEN_KEY = 'rc_admin_token'
const ADMIN_KEY = 'rc_admin_profile'

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null)
  const [admin, setAdmin] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(ADMIN_KEY) || 'null')
    } catch {
      return null
    }
  })

  function persist(t, user) {
    setToken(t)
    setAdmin(user)
    localStorage.setItem(TOKEN_KEY, t)
    localStorage.setItem(ADMIN_KEY, JSON.stringify(user))
  }

  async function login(username, password) {
    const { token: t, user } = await usersApi.adminLogin({ username, password })
    persist(t, user)
    return user
  }

  // Returns { user, recoveryCode } — the caller must show the recovery code
  // to the admin immediately; it is never retrievable again.
  async function signup(name, username, password) {
    const { token: t, user, recoveryCode } = await usersApi.adminSignup({ name, username, password })
    persist(t, user)
    return { user, recoveryCode }
  }

  // Returns the new one-time recoveryCode to display once. Does not log the
  // admin in — they still sign in with their new password afterward.
  async function resetPassword(username, recoveryCode, newPassword) {
    const { recoveryCode: newCode } = await usersApi.adminResetPassword({
      username,
      recoveryCode,
      newPassword,
    })
    return newCode
  }

  function logout() {
    setToken(null)
    setAdmin(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ADMIN_KEY)
  }

  return (
    <AdminAuthContext.Provider value={{ token, admin, login, signup, resetPassword, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  return ctx
}
