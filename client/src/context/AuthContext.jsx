import { createContext, useContext, useEffect, useState } from 'react'
import { usersApi } from '../api'

const AuthContext = createContext(null)
const TOKEN_KEY = 'dukatao_token'
const USER_KEY = 'dukatao_user'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null)
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (!token) return
    usersApi
      .me(token)
      .then((freshUser) => {
        setUser(freshUser)
        localStorage.setItem(USER_KEY, JSON.stringify(freshUser))
      })
      .catch(() => logout())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function persist(nextToken, nextUser) {
    setToken(nextToken)
    setUser(nextUser)
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
  }

  async function login(email, password) {
    const { token: t, user: u } = await usersApi.login({ email, password })
    persist(t, u)
    return u
  }

  async function register(payload) {
    const { token: t, user: u } = await usersApi.register(payload)
    persist(t, u)
    return u
  }

  async function updateProfile(payload) {
    const updated = await usersApi.updateMe(payload, token)
    setUser(updated)
    localStorage.setItem(USER_KEY, JSON.stringify(updated))
    return updated
  }

  function logout() {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
