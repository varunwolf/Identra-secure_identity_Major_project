import { createContext, useContext, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'

const AuthContext = createContext()

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

// Configure axios defaults
axios.defaults.baseURL = API_BASE
axios.defaults.headers.common['Content-Type'] = 'application/json'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Set up axios interceptor for token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // Fetch user data when token exists
  const { data: userData, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user', token],
    queryFn: async () => {
      if (!token) return null
      const response = await axios.get('/auth/me')
      return response.data
    },
    enabled: !!token,
    retry: false,
    onError: (error) => {
      if (error.response?.status === 401) {
        logout()
      }
    }
  })

  useEffect(() => {
    if (userData) {
      setUser(userData)
    }
    // Only show loading if we have a token but no user data yet
    setLoading(!!token && !userData && userLoading)
  }, [userData, userLoading, token])

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password })
      const { token: newToken, user: userData } = response.data
      
      setToken(newToken)
      setUser(userData)
      localStorage.setItem('token', newToken)
      
      // Set loading to false immediately after successful login
      setLoading(false)
      
      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData)
      const { token: newToken, user: newUser } = response.data
      
      setToken(newToken)
      setUser(newUser)
      localStorage.setItem('token', newToken)
      
      toast.success('Registration successful!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    toast.success('Logged out successfully')
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!token && !!user
  }

  return (
    <AuthContext.Provider value={value}>
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
