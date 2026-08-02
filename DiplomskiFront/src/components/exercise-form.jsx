import { useState } from "react"
import { useNavigate } from "react-router"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

import { createExerciseRequest, updateExerciseRequest } from "@/api/exercises"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MUSCLE_GROUPS } from "@/lib/muscle-groups"

export function ExerciseForm({ exercise }) {
  const { t } = useTranslation()
  const isEditing = Boolean(exercise)
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: exercise?.name ?? "",
    muscleGroup: exercise?.muscleGroup ?? "",
    equipment: exercise?.equipment ?? "",
    description: exercise?.description ?? "",
    videoUrl: exercise?.videoUrl ?? "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.name.trim()) {
      toast.error(t("exercises.form.toasts.nameRequired"))
      return
    }
    if (!form.muscleGroup) {
      toast.error(t("exercises.form.toasts.muscleGroupRequired"))
      return
    }

    const payload = {
      name: form.name.trim(),
      muscleGroup: form.muscleGroup,
      equipment: form.equipment.trim(),
      description: form.description.trim(),
      videoUrl: form.videoUrl.trim(),
    }

    setIsSubmitting(true)
    try {
      const savedExercise = isEditing
        ? await updateExerciseRequest(exercise._id, payload)
        : await createExerciseRequest(payload)

      toast.success(isEditing ? t("exercises.form.toasts.updateSuccess") : t("exercises.form.toasts.createSuccess"))
      navigate(`/exercises/${savedExercise._id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || t("exercises.form.toasts.saveFailed"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="exercise-name">{t("exercises.form.nameLabel")}</FieldLabel>
          <Input
            id="exercise-name"
            value={form.name}
            onChange={handleChange("name")}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="exercise-muscle-group">{t("exercises.form.muscleGroupLabel")}</FieldLabel>
          <Select
            value={form.muscleGroup}
            onValueChange={(value) => setForm((prev) => ({ ...prev, muscleGroup: value }))}
          >
            <SelectTrigger id="exercise-muscle-group">
              <SelectValue placeholder={t("exercises.form.muscleGroupPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {MUSCLE_GROUPS.map((group) => (
                <SelectItem key={group.value} value={group.value}>
                  {t(group.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="exercise-equipment">{t("exercises.form.equipmentLabel")}</FieldLabel>
          <Input
            id="exercise-equipment"
            placeholder={t("exercises.form.equipmentPlaceholder")}
            value={form.equipment}
            onChange={handleChange("equipment")}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="exercise-description">{t("exercises.form.descriptionLabel")}</FieldLabel>
          <Textarea
            id="exercise-description"
            rows={4}
            value={form.description}
            onChange={handleChange("description")}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="exercise-video">{t("exercises.form.videoLabel")}</FieldLabel>
          <Input
            id="exercise-video"
            type="url"
            placeholder={t("exercises.form.videoPlaceholder")}
            value={form.videoUrl}
            onChange={handleChange("videoUrl")}
          />
          <FieldDescription>
            {t("exercises.form.videoHint")}
          </FieldDescription>
        </Field>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t("exercises.form.submitting")
              : isEditing
                ? t("exercises.form.submitEdit")
                : t("exercises.form.submitCreate")}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            {t("exercises.form.cancel")}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
