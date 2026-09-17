import { createContext, useContext, useState } from 'react'
import { vendorsApi } from '../api'

const VendorAuthContext = createContext(null)
const TOKEN_KEY = 'rc_vendor_token'
const VENDOR_KEY = 'rc_vendor_profile'

export function VendorAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null)
  const [vendor, setVendor] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(VENDOR_KEY) || 'null')
    } catch {
      return null
    }
  })

  function persist(nextToken, nextVendor) {
    setToken(nextToken)
    setVendor(nextVendor)
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(VENDOR_KEY, JSON.stringify(nextVendor))
  }

  async function login(email, password) {
    const { token: t, vendor: v } = await vendorsApi.login({ email, password })
    persist(t, v)
    return v
  }

  function logout() {
    setToken(null)
    setVendor(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(VENDOR_KEY)
  }

  return (
    <VendorAuthContext.Provider value={{ token, vendor, login, logout }}>
      {children}
    </VendorAuthContext.Provider>
  )
}

export function useVendorAuth() {
  const ctx = useContext(VendorAuthContext)
  if (!ctx) throw new Error('useVendorAuth must be used within a VendorAuthProvider')
  return ctx
}
