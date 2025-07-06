import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, pass: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('authToken')
      if (storedToken) {
        // For now, just set the token and let the user try to use it
        // The API calls will fail if the token is invalid
        setToken(storedToken)
        console.log('Token restored from localStorage:', storedToken)
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, pass }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Login response:', data) // Debug log
        
        // Validate response format and admin role
        if (
          typeof data.token === 'string' &&
          data.user &&
          (data.user.role_id === 1 || data.user.role_id === 2)
        ) {
          setUser({
            id: data.user.user_id,
            email: data.user.email, 
            name: data.user.name,
            role: String(data.user.role_id),
          })
          setToken(data.token)
          localStorage.setItem('authToken', data.token)
          console.log('Token stored:', data.token) // Debug log
          return true
        } else {
          // Not authorized (not admin)
          console.log('User not authorized - role_id:', data.user?.role_id) // Debug log
          return false
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.log('Login failed:', errorData) // Debug log
        return false
      }
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('authToken')
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 