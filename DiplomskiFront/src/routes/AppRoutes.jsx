import { Routes, Route } from "react-router"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import ForgotPassword from "@/pages/ForgotPassword"
import ResetPassword from "@/pages/ResetPassword"
import CompleteProfile from "@/pages/CompleteProfile"
import Home from "@/pages/Home"
import Exercises from "@/pages/Exercises"
import ExerciseDetail from "@/pages/ExerciseDetail"
import ExerciseFormPage from "@/pages/ExerciseFormPage"
import WorkoutPlans from "@/pages/WorkoutPlans"
import WorkoutPlanDetail from "@/pages/WorkoutPlanDetail"
import WorkoutPlanDayDetail from "@/pages/WorkoutPlanDayDetail"
import WorkoutPlanFormPage from "@/pages/WorkoutPlanFormPage"
import Supplements from "@/pages/Supplements"
import SupplementFormPage from "@/pages/SupplementFormPage"
import MySupplements from "@/pages/MySupplements"
import UserSupplementFormPage from "@/pages/UserSupplementFormPage"
import NearbyGyms from "@/pages/NearbyGyms"
import NutritionLog from "@/pages/NutritionLog"
import { ProtectedRoute } from "@/routes/ProtectedRoute"

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercises"
        element={
          <ProtectedRoute>
            <Exercises />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercises/new"
        element={
          <ProtectedRoute adminOnly>
            <ExerciseFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercises/:id"
        element={
          <ProtectedRoute>
            <ExerciseDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercises/:id/edit"
        element={
          <ProtectedRoute adminOnly>
            <ExerciseFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workout-plans"
        element={
          <ProtectedRoute>
            <WorkoutPlans />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workout-plans/new"
        element={
          <ProtectedRoute>
            <WorkoutPlanFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workout-plans/:id"
        element={
          <ProtectedRoute>
            <WorkoutPlanDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workout-plans/:id/edit"
        element={
          <ProtectedRoute>
            <WorkoutPlanFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workout-plans/:id/days/:dayId"
        element={
          <ProtectedRoute>
            <WorkoutPlanDayDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supplements"
        element={
          <ProtectedRoute>
            <Supplements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supplements/new"
        element={
          <ProtectedRoute adminOnly>
            <SupplementFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supplements/:id/edit"
        element={
          <ProtectedRoute adminOnly>
            <SupplementFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-supplements"
        element={
          <ProtectedRoute>
            <MySupplements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-supplements/new"
        element={
          <ProtectedRoute>
            <UserSupplementFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-supplements/:id/edit"
        element={
          <ProtectedRoute>
            <UserSupplementFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nearby-gyms"
        element={
          <ProtectedRoute>
            <NearbyGyms />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nutrition-log"
        element={
          <ProtectedRoute>
            <NutritionLog />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
