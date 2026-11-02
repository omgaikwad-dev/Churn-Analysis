import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('churnguard_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function verifySession() {
      const storedToken = localStorage.getItem('churnguard_token')
      if (!storedToken) {
        setLoading(false)
        return
      }
      try {
        const { data } = await api.get('/auth/me')
        setUser(data)
      } catch (err) {
        console.warn('Session verification failed:', err)
        localStorage.removeItem('churnguard_token')
        localStorage.removeItem('churnguard_user')
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }
    verifySession()
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('churnguard_token', data.access_token)
    localStorage.setItem('churnguard_user', JSON.stringify(data.user))
    setToken(data.access_token)
    setUser(data.user)
    return data.user
  }

  const register = async (fullName, email, password) => {
    const { data } = await api.post('/auth/register', {
      full_name: fullName,
      email,
      password,
    })
    localStorage.setItem('churnguard_token', data.access_token)
    localStorage.setItem('churnguard_user', JSON.stringify(data.user))
    setToken(data.access_token)
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('churnguard_token')
      localStorage.removeItem('churnguard_user')
      setUser(null)
      setToken(null)
    }
  }

  const updateUserState = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('churnguard_user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
