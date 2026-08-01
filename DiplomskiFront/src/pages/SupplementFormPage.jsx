import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import toast from "react-hot-toast"

import { getSupplementRequest } from "@/api/supplements"
import { AppLayout } from "@/components/app-layout"
import { SupplementForm } from "@/components/supplement-form"
import { FormSkeleton } from "@/components/ui/form-skeleton"

export default function SupplementFormPage() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const [supplement, setSupplement] = useState(null)
  const [isLoading, setIsLoading] = useState(isEditing)

  useEffect(() => {
    if (!isEditing) return

    getSupplementRequest(id)
      .then(setSupplement)
      .catch((error) => {
        toast.error(error.response?.data?.message || "Suplement nije pronađen")
        navigate("/supplements")
      })
      .finally(() => setIsLoading(false))
  }, [id, isEditing, navigate])

  return (
    <AppLayout breadcrumb={isEditing ? "Izmena suplementa" : "Novi suplement"}>
      <div className="mx-auto w-full max-w-xl">
        {isLoading ? (
          <FormSkeleton fields={3} />
        ) : (
          <SupplementForm supplement={supplement} />
        )}
      </div>
    </AppLayout>
  )
}
