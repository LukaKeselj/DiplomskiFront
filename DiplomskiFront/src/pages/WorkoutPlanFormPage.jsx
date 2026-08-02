import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

import { getWorkoutPlanRequest } from "@/api/workoutPlans"
import { AppLayout } from "@/components/app-layout"
import { WorkoutPlanForm } from "@/components/workout-plan-form"
import { FormSkeleton } from "@/components/ui/form-skeleton"

export default function WorkoutPlanFormPage() {
  const { t } = useTranslation()
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
          toast.error(t("workout.form.toasts.accessDenied"))
        } else {
          toast.error(error.response?.data?.message || t("workout.form.toasts.notFound"))
        }
        navigate("/workout-plans")
      })
      .finally(() => setIsLoading(false))
  }, [id, isEditing, navigate, t])

  return (
    <AppLayout breadcrumb={isEditing ? t("workout.form.breadcrumbEdit") : t("workout.form.breadcrumbNew")}>
      <div className="mx-auto w-full max-w-2xl">
        {isLoading ? (
          <FormSkeleton fields={5} />
        ) : (
          <WorkoutPlanForm plan={plan} />
        )}
      </div>
    </AppLayout>
  )
}
