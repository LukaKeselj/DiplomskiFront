import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

import { getNutritionPlanRequest } from "@/api/nutritionPlans"
import { AppLayout } from "@/components/app-layout"
import { NutritionPlanForm } from "@/components/nutrition-plan-form"
import { FormSkeleton } from "@/components/ui/form-skeleton"

export default function NutritionPlanFormPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [isLoading, setIsLoading] = useState(isEditing)

  useEffect(() => {
    if (!isEditing) return

    getNutritionPlanRequest(id)
      .then(setPlan)
      .catch((error) => {
        if (error.response?.status === 403) {
          toast.error(t("nutrition.planForm.accessDenied"))
        } else {
          toast.error(error.response?.data?.message || t("nutrition.planForm.notFound"))
        }
        navigate("/nutrition-plans")
      })
      .finally(() => setIsLoading(false))
  }, [id, isEditing, navigate, t])

  return (
    <AppLayout
      breadcrumb={isEditing ? t("nutrition.planForm.breadcrumbEdit") : t("nutrition.planForm.breadcrumbNew")}
    >
      <div className="mx-auto w-full max-w-2xl">
        {isLoading ? (
          <FormSkeleton fields={5} />
        ) : (
          <NutritionPlanForm plan={plan} />
        )}
      </div>
    </AppLayout>
  )
}
