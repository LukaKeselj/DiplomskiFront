import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

import { getUserSupplementRequest } from "@/api/supplements"
import { AppLayout } from "@/components/app-layout"
import { UserSupplementForm } from "@/components/user-supplement-form"
import { FormSkeleton } from "@/components/ui/form-skeleton"

export default function UserSupplementFormPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const [userSupplement, setUserSupplement] = useState(null)
  const [isLoading, setIsLoading] = useState(isEditing)

  useEffect(() => {
    if (!isEditing) return

    getUserSupplementRequest(id)
      .then(setUserSupplement)
      .catch((error) => {
        if (error.response?.status === 403) {
          toast.error(t("supplements.userForm.accessDenied"))
        } else {
          toast.error(error.response?.data?.message || t("supplements.userForm.notFound"))
        }
        navigate("/my-supplements")
      })
      .finally(() => setIsLoading(false))
  }, [id, isEditing, navigate, t])

  return (
    <AppLayout
      breadcrumb={isEditing ? t("supplements.userForm.breadcrumbEdit") : t("supplements.userForm.breadcrumbAdd")}
    >
      <div className="mx-auto w-full max-w-xl">
        {isLoading ? (
          <FormSkeleton fields={3} />
        ) : (
          <UserSupplementForm userSupplement={userSupplement} />
        )}
      </div>
    </AppLayout>
  )
}
