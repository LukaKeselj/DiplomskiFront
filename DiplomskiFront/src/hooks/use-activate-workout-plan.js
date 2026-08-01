import { useState } from "react"
import toast from "react-hot-toast"

import { activateWorkoutPlanRequest } from "@/api/workoutPlans"
import { useAuth } from "@/context/AuthContext"

export function useActivateWorkoutPlan() {
  const { updateUser } = useAuth()
  const [isActivating, setIsActivating] = useState(false)

  async function activate(planId) {
    setIsActivating(true)
    try {
      const updatedUser = await activateWorkoutPlanRequest(planId)
      updateUser(updatedUser)
      toast.success("Plan je aktiviran")
    } catch (error) {
      toast.error(error.response?.data?.message || "Aktivacija nije uspela")
    } finally {
      setIsActivating(false)
    }
  }

  return { isActivating, activate }
}
