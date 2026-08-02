import { useState } from "react"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

import { activateWorkoutPlanRequest } from "@/api/workoutPlans"
import { useAuth } from "@/context/AuthContext"

export function useActivateWorkoutPlan() {
  const { t } = useTranslation()
  const { updateUser } = useAuth()
  const [isActivating, setIsActivating] = useState(false)

  async function activate(planId) {
    setIsActivating(true)
    try {
      const updatedUser = await activateWorkoutPlanRequest(planId)
      updateUser(updatedUser)
      toast.success(t("workout.activatePlan.toasts.success"))
    } catch (error) {
      toast.error(error.response?.data?.message || t("workout.activatePlan.toasts.failed"))
    } finally {
      setIsActivating(false)
    }
  }

  return { isActivating, activate }
}
