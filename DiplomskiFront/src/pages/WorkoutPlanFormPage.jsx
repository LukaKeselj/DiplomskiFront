import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import toast from "react-hot-toast"

import { getWorkoutPlanRequest } from "@/api/workoutPlans"
import { AppLayout } from "@/components/app-layout"
import { WorkoutPlanForm } from "@/components/workout-plan-form"

export default function WorkoutPlanFormPage() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [isLoading, setIsLoading] = useState(isEditing)

  useEffect(() => {
    if (!isEditing) return

    getWorkoutPlanRequest(id)
      .then(setPlan)
      .catch((error) => {
        if (error.response?.status === 403) {
          toast.error("Nemaš pristup ovom planu")
        } else {
          toast.error(error.response?.data?.message || "Plan nije pronađen")
        }
        navigate("/workout-plans")
      })
      .finally(() => setIsLoading(false))
  }, [id, isEditing, navigate])

  return (
    <AppLayout breadcrumb={isEditing ? "Izmena plana" : "Novi plan"}>
      <div className="mx-auto w-full max-w-2xl">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Učitavanje...</p>
        ) : (
          <WorkoutPlanForm plan={plan} />
        )}
      </div>
    </AppLayout>
  )
}
