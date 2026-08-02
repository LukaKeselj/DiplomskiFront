import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

import { getExerciseRequest } from "@/api/exercises"
import { AppLayout } from "@/components/app-layout"
import { ExerciseForm } from "@/components/exercise-form"
import { FormSkeleton } from "@/components/ui/form-skeleton"

export default function ExerciseFormPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const [exercise, setExercise] = useState(null)
  const [isLoading, setIsLoading] = useState(isEditing)

  useEffect(() => {
    if (!isEditing) return

    getExerciseRequest(id)
      .then(setExercise)
      .catch((error) => {
        toast.error(error.response?.data?.message || t("exercises.form.toasts.notFound"))
        navigate("/exercises")
      })
      .finally(() => setIsLoading(false))
  }, [id, isEditing, navigate, t])

  return (
    <AppLayout breadcrumb={isEditing ? t("exercises.form.breadcrumbEdit") : t("exercises.form.breadcrumbNew")}>
      <div className="mx-auto w-full max-w-xl">
        {isLoading ? (
          <FormSkeleton fields={4} />
        ) : (
          <ExerciseForm exercise={exercise} />
        )}
      </div>
    </AppLayout>
  )
}
