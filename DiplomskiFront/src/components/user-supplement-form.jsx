import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import toast from "react-hot-toast"

import {
  createUserSupplementRequest,
  getSupplementsRequest,
  updateUserSupplementRequest,
} from "@/api/supplements"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function UserSupplementForm({ userSupplement }) {
  const isEditing = Boolean(userSupplement)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedSupplementId = searchParams.get("supplementId") ?? ""

  const [supplements, setSupplements] = useState([])
  const [isLoadingSupplements, setIsLoadingSupplements] = useState(true)
  const [form, setForm] = useState({
    supplement: userSupplement?.supplement ?? preselectedSupplementId,
    dosage: userSupplement?.dosage ?? "",
    timeOfDay: userSupplement?.timeOfDay ?? "",
    active: userSupplement?.active ?? true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    getSupplementsRequest()
      .then(setSupplements)
      .catch((error) => {
        toast.error(error.response?.data?.message || "Neuspešno učitavanje suplemenata")
      })
      .finally(() => setIsLoadingSupplements(false))
  }, [])

  function handleChange(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.supplement) {
      toast.error("Suplement je obavezan")
      return
    }
    if (!form.dosage.trim()) {
      toast.error("Doza je obavezna")
      return
    }
    if (!form.timeOfDay.trim()) {
      toast.error("Vreme uzimanja je obavezno")
      return
    }

    const payload = {
      supplement: form.supplement,
      dosage: form.dosage.trim(),
      timeOfDay: form.timeOfDay.trim(),
      active: form.active,
    }

    setIsSubmitting(true)
    try {
      if (isEditing) {
        await updateUserSupplementRequest(userSupplement._id, payload)
        toast.success("Suplement u režimu je ažuriran")
      } else {
        await createUserSupplementRequest(payload)
        toast.success("Suplement je dodat u tvoj režim")
      }
      navigate("/my-supplements")
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("Nemaš dozvolu da izmeniš ovaj zapis")
      } else {
        toast.error(error.response?.data?.message || "Čuvanje nije uspelo")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="user-supplement-supplement">Suplement</FieldLabel>
          <Select
            value={form.supplement}
            onValueChange={(value) => setForm((prev) => ({ ...prev, supplement: value }))}
          >
            <SelectTrigger id="user-supplement-supplement" disabled={isLoadingSupplements}>
              <SelectValue placeholder="Izaberi suplement" />
            </SelectTrigger>
            <SelectContent>
              {supplements.map((supplement) => (
                <SelectItem key={supplement._id} value={supplement._id}>
                  {supplement.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="user-supplement-dosage">Doza</FieldLabel>
          <Input
            id="user-supplement-dosage"
            placeholder="npr. 500mg"
            value={form.dosage}
            onChange={handleChange("dosage")}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="user-supplement-time">Vreme uzimanja</FieldLabel>
          <Input
            id="user-supplement-time"
            placeholder="npr. ujutru, pre treninga"
            value={form.timeOfDay}
            onChange={handleChange("timeOfDay")}
          />
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            id="user-supplement-active"
            checked={form.active}
            onCheckedChange={(checked) =>
              setForm((prev) => ({ ...prev, active: checked === true }))
            }
          />
          <FieldLabel htmlFor="user-supplement-active">Aktivan</FieldLabel>
        </Field>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Čuvanje..." : isEditing ? "Sačuvaj izmene" : "Dodaj u režim"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Otkaži
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
