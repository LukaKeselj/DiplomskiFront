import { createContext, useContext, useEffect, useState } from "react"
import { logoutRequest } from "@/api/auth"
import { AUTH_STORAGE_KEY } from "@/lib/authStorage"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }, [user])

  function login({ user: loggedInUser }) {
    setUser(loggedInUser)
  }

  async function logout() {
    try {
      await logoutRequest()
    } catch {
      // ignore network errors, clear local state regardless
    }
    setUser(null)
  }

  function updateUser(updatedUser) {
    setUser((prev) => (prev ? { ...prev, ...updatedUser } : prev))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
