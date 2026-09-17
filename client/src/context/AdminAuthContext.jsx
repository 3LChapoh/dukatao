import { createContext, useContext, useEffect, useState } from 'react'
import { usersApi } from '../api'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const [token, setToken] = useState(
    () => localStorage.getItem('adminToken') || ''
  )

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken')

    if (!storedToken) {
      setLoading(false)
      return
    }

    usersApi
      .me(storedToken)
      .then((currentUser) => {
        if (currentUser?.role === 'admin') {
          setUser(currentUser)
          setToken(storedToken)
        } else {
          localStorage.removeItem('adminToken')
          setToken('')
        }
      })
      .catch(() => {
        localStorage.removeItem('adminToken')
        setToken('')
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  async function login(username, password) {
    const result = await usersApi.adminLogin({
      username,
      password,
    })

    const loggedInUser = result?.user
    const newToken = result?.token

    if (loggedInUser?.role !== 'admin') {
      throw new Error('This account is not an admin account')
    }

    if (!newToken) {
      throw new Error('Admin login did not return a token')
    }

    localStorage.setItem('adminToken', newToken)

    setToken(newToken)
    setUser(loggedInUser)

    return loggedInUser
  }

  function logout() {
    localStorage.removeItem('adminToken')
    setToken('')
    setUser(null)
  }

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  return useContext(AdminAuthContext)
}   
