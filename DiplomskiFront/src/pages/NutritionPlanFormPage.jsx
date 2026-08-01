import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import toast from "react-hot-toast"

import { getNutritionPlanRequest } from "@/api/nutritionPlans"
import { AppLayout } from "@/components/app-layout"
import { NutritionPlanForm } from "@/components/nutrition-plan-form"
import { FormSkeleton } from "@/components/ui/form-skeleton"

export default function NutritionPlanFormPage() {
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
          toast.error("Nemaš pristup ovom planu")
        } else {
          toast.error(error.response?.data?.message || "Plan nije pronađen")
        }
        navigate("/nutrition-plans")
      })
      .finally(() => setIsLoading(false))
  }, [id, isEditing, navigate])

  return (
    <AppLayout breadcrumb={isEditing ? "Izmena plana ishrane" : "Novi plan ishrane"}>
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
