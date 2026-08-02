import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

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

export function UserSupplementForm({ userSupplement, onSaved, onCancel }) {
  const { t } = useTranslation()
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
        toast.error(error.response?.data?.message || t("supplements.userForm.loadError"))
      })
      .finally(() => setIsLoadingSupplements(false))
  }, [t])

  function handleChange(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.supplement) {
      toast.error(t("supplements.userForm.supplementRequired"))
      return
    }
    if (!form.dosage.trim()) {
      toast.error(t("supplements.userForm.dosageRequired"))
      return
    }
    if (!form.timeOfDay.trim()) {
      toast.error(t("supplements.userForm.timeRequired"))
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
      let saved
      if (isEditing) {
        saved = await updateUserSupplementRequest(userSupplement._id, payload)
        toast.success(t("supplements.userForm.updateSuccess"))
      } else {
        saved = await createUserSupplementRequest(payload)
        toast.success(t("supplements.userForm.createSuccess"))
      }
      if (onSaved) {
        onSaved(saved)
      } else {
        navigate("/my-supplements")
      }
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(t("supplements.userForm.updateForbidden"))
      } else {
        toast.error(error.response?.data?.message || t("supplements.userForm.saveFailed"))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="user-supplement-supplement">{t("supplements.userForm.supplementLabel")}</FieldLabel>
          <Select
            value={form.supplement}
            onValueChange={(value) => setForm((prev) => ({ ...prev, supplement: value }))}
          >
            <SelectTrigger id="user-supplement-supplement" disabled={isLoadingSupplements}>
              <SelectValue placeholder={t("supplements.userForm.supplementPlaceholder")} />
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
          <FieldLabel htmlFor="user-supplement-dosage">{t("supplements.userForm.dosageLabel")}</FieldLabel>
          <Input
            id="user-supplement-dosage"
            placeholder={t("supplements.userForm.dosagePlaceholder")}
            value={form.dosage}
            onChange={handleChange("dosage")}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="user-supplement-time">{t("supplements.userForm.timeLabel")}</FieldLabel>
          <Input
            id="user-supplement-time"
            placeholder={t("supplements.userForm.timePlaceholder")}
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
          <FieldLabel htmlFor="user-supplement-active">{t("supplements.userForm.activeLabel")}</FieldLabel>
        </Field>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t("supplements.userForm.saving")
              : isEditing
                ? t("supplements.userForm.saveChanges")
                : t("supplements.userForm.addToRoutine")}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel ?? (() => navigate(-1))}>
            {t("supplements.userForm.cancel")}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
