import { Routes, Route } from "react-router"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import CompleteProfile from "@/pages/CompleteProfile"
import Home from "@/pages/Home"
import { ProtectedRoute } from "@/routes/ProtectedRoute"

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
