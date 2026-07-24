import { useState } from "react"
import { useNavigate } from "react-router"
import toast from "react-hot-toast"

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
      toast.error("Naziv vežbe je obavezan")
      return
    }
    if (!form.muscleGroup) {
      toast.error("Mišićna grupa je obavezna")
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

      toast.success(isEditing ? "Vežba je ažurirana" : "Vežba je kreirana")
      navigate(`/exercises/${savedExercise._id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || "Čuvanje vežbe nije uspelo")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="exercise-name">Naziv vežbe</FieldLabel>
          <Input
            id="exercise-name"
            value={form.name}
            onChange={handleChange("name")}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="exercise-muscle-group">Mišićna grupa</FieldLabel>
          <Select
            value={form.muscleGroup}
            onValueChange={(value) => setForm((prev) => ({ ...prev, muscleGroup: value }))}
          >
            <SelectTrigger id="exercise-muscle-group">
              <SelectValue placeholder="Izaberi mišićnu grupu" />
            </SelectTrigger>
            <SelectContent>
              {MUSCLE_GROUPS.map((group) => (
                <SelectItem key={group.value} value={group.value}>
                  {group.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="exercise-equipment">Oprema</FieldLabel>
          <Input
            id="exercise-equipment"
            placeholder="npr. Šipka, Bučice"
            value={form.equipment}
            onChange={handleChange("equipment")}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="exercise-description">Opis</FieldLabel>
          <Textarea
            id="exercise-description"
            rows={4}
            value={form.description}
            onChange={handleChange("description")}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="exercise-video">YouTube link</FieldLabel>
          <Input
            id="exercise-video"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={form.videoUrl}
            onChange={handleChange("videoUrl")}
          />
          <FieldDescription>
            Podržani su youtube.com/watch, youtu.be i /shorts/ linkovi.
          </FieldDescription>
        </Field>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Čuvanje..." : isEditing ? "Sačuvaj izmene" : "Kreiraj vežbu"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Otkaži
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
