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

  async function login(email, password, securityKey) {
    const { token: t, user } = await usersApi.adminLogin({ email, password, securityKey })
    setToken(t)
    setAdmin(user)
    localStorage.setItem(TOKEN_KEY, t)
    localStorage.setItem(ADMIN_KEY, JSON.stringify(user))
    return user
  }

  function logout() {
    setToken(null)
    setAdmin(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ADMIN_KEY)
  }

  return (
    <AdminAuthContext.Provider value={{ token, admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  return ctx
}
