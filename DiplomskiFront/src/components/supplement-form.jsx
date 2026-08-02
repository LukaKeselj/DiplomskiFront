import { useState } from "react"
import { useNavigate } from "react-router"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

import { createSupplementRequest, updateSupplementRequest } from "@/api/supplements"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function SupplementForm({ supplement }) {
  const { t } = useTranslation()
  const isEditing = Boolean(supplement)
  const navigate = useNavigate()
  const [name, setName] = useState(supplement?.name ?? "")
  const [imageUrl, setImageUrl] = useState(supplement?.imageUrl ?? "")
  const [description, setDescription] = useState(supplement?.description ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (!name.trim()) {
      toast.error(t("supplements.form.nameRequired"))
      return
    }

    const payload = { name: name.trim(), imageUrl, description: description.trim() }

    setIsSubmitting(true)
    try {
      if (isEditing) {
        await updateSupplementRequest(supplement._id, payload)
        toast.success(t("supplements.form.updateSuccess"))
      } else {
        await createSupplementRequest(payload)
        toast.success(t("supplements.form.createSuccess"))
      }
      navigate("/supplements")
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error(t("supplements.form.duplicateName"))
      } else {
        toast.error(error.response?.data?.message || t("supplements.form.saveFailed"))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex items-center gap-4">
          <Avatar size="lg" className="size-16">
            <AvatarImage src={imageUrl} alt={name} className="object-contain" />
            <AvatarFallback className="text-base">
              {name.trim().slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Field className="flex-1">
            <FieldLabel htmlFor="supplement-image-url">{t("supplements.form.imageUrlLabel")}</FieldLabel>
            <Input
              id="supplement-image-url"
              type="url"
              placeholder={t("supplements.form.imageUrlPlaceholder")}
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
            />
            <FieldDescription>{t("supplements.form.imageUrlHint")}</FieldDescription>
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="supplement-name">{t("supplements.form.nameLabel")}</FieldLabel>
          <Input
            id="supplement-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="supplement-description">{t("supplements.form.descriptionLabel")}</FieldLabel>
          <Textarea
            id="supplement-description"
            placeholder={t("supplements.form.descriptionPlaceholder")}
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t("supplements.form.saving")
              : isEditing
                ? t("supplements.form.saveChanges")
                : t("supplements.form.createSupplement")}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            {t("supplements.form.cancel")}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
