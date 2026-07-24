import { Navigate } from "react-router"
import { useAuth } from "@/context/AuthContext"

export function ProtectedRoute({ children, adminOnly = false }) {
  const { token, user } = useAuth()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/exercises" replace />
  }

  return children
}
