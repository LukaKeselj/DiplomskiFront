import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import toast from "react-hot-toast"

import { getUserSupplementRequest } from "@/api/supplements"
import { AppLayout } from "@/components/app-layout"
import { UserSupplementForm } from "@/components/user-supplement-form"
import { FormSkeleton } from "@/components/ui/form-skeleton"

export default function UserSupplementFormPage() {
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
          toast.error("Nemaš pristup ovom zapisu")
        } else {
          toast.error(error.response?.data?.message || "Zapis nije pronađen")
        }
        navigate("/my-supplements")
      })
      .finally(() => setIsLoading(false))
  }, [id, isEditing, navigate])

  return (
    <AppLayout breadcrumb={isEditing ? "Izmena suplementa" : "Dodaj suplement u režim"}>
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
