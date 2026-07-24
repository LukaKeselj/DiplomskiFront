import { createContext, useContext, useEffect, useState } from "react"

const AuthContext = createContext(null)
const STORAGE_KEY = "auth"

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  })

  useEffect(() => {
    if (auth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [auth])

  function login({ token, user }) {
    setAuth({ token, user })
  }

  function logout() {
    setAuth(null)
  }

  function updateUser(updatedUser) {
    setAuth((prev) => (prev ? { ...prev, user: { ...prev.user, ...updatedUser } } : prev))
  }

  return (
    <AuthContext.Provider
      value={{
        token: auth?.token ?? null,
        user: auth?.user ?? null,
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
