import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import toast from "react-hot-toast"
import { Plus, Trash2 } from "lucide-react"

import { createWorkoutPlanRequest, updateWorkoutPlanRequest } from "@/api/workoutPlans"
import { getExercisesRequest } from "@/api/exercises"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

let uidCounter = 0
function nextUid() {
  uidCounter += 1
  return `new-${uidCounter}`
}

function emptyExercise() {
  return { uid: nextUid(), exercise: "", targetSets: "", targetReps: "" }
}

function emptyDay() {
  return { uid: nextUid(), dayName: "", exercises: [emptyExercise()] }
}

function daysFromPlan(plan) {
  if (!plan?.days?.length) return [emptyDay()]

  return plan.days.map((day) => ({
    uid: day._id ?? nextUid(),
    dayName: day.dayName ?? "",
    exercises: day.exercises?.length
      ? day.exercises.map((exercise) => ({
          uid: exercise._id ?? nextUid(),
          exercise: exercise.exercise ?? "",
          targetSets: exercise.targetSets ?? "",
          targetReps: exercise.targetReps ?? "",
        }))
      : [emptyExercise()],
  }))
}

export function WorkoutPlanForm({ plan }) {
  const isEditing = Boolean(plan)
  const navigate = useNavigate()
  const [exercises, setExercises] = useState([])
  const [isLoadingExercises, setIsLoadingExercises] = useState(true)
  const [name, setName] = useState(plan?.name ?? "")
  const [days, setDays] = useState(() => daysFromPlan(plan))
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    getExercisesRequest()
      .then(setExercises)
      .catch((error) => {
        toast.error(error.response?.data?.message || "Neuspešno učitavanje vežbi")
      })
      .finally(() => setIsLoadingExercises(false))
  }, [])

  function handleDayNameChange(dayIndex, value) {
    setDays((prev) =>
      prev.map((day, index) => (index === dayIndex ? { ...day, dayName: value } : day))
    )
  }

  function handleAddDay() {
    setDays((prev) => [...prev, emptyDay()])
  }

  function handleRemoveDay(dayIndex) {
    setDays((prev) => prev.filter((_, index) => index !== dayIndex))
  }

  function handleAddExercise(dayIndex) {
    setDays((prev) =>
      prev.map((day, index) =>
        index === dayIndex ? { ...day, exercises: [...day.exercises, emptyExercise()] } : day
      )
    )
  }

  function handleRemoveExercise(dayIndex, exerciseIndex) {
    setDays((prev) =>
      prev.map((day, index) =>
        index === dayIndex
          ? { ...day, exercises: day.exercises.filter((_, i) => i !== exerciseIndex) }
          : day
      )
    )
  }

  function handleExerciseFieldChange(dayIndex, exerciseIndex, field, value) {
    setDays((prev) =>
      prev.map((day, index) =>
        index === dayIndex
          ? {
              ...day,
              exercises: day.exercises.map((exercise, i) =>
                i === exerciseIndex ? { ...exercise, [field]: value } : exercise
              ),
            }
          : day
      )
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!name.trim()) {
      toast.error("Naziv plana je obavezan")
      return
    }
    if (days.some((day) => !day.dayName.trim())) {
      toast.error("Naziv dana je obavezan")
      return
    }

    const payload = {
      name: name.trim(),
      days: days.map((day) => ({
        dayName: day.dayName.trim(),
        exercises: day.exercises.map((exercise) => ({
          exercise: exercise.exercise,
          targetSets: Number(exercise.targetSets) || 0,
          targetReps: Number(exercise.targetReps) || 0,
        })),
      })),
    }

    setIsSubmitting(true)
    try {
      const savedPlan = isEditing
        ? await updateWorkoutPlanRequest(plan._id, payload)
        : await createWorkoutPlanRequest(payload)

      toast.success(isEditing ? "Plan je ažuriran" : "Plan je kreiran")
      navigate(`/workout-plans/${savedPlan._id}`)
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("Nemaš dozvolu da izmeniš ovaj plan")
      } else {
        toast.error(error.response?.data?.message || "Čuvanje plana nije uspelo")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="plan-name">Naziv plana</FieldLabel>
          <Input id="plan-name" value={name} onChange={(event) => setName(event.target.value)} required />
        </Field>
      </FieldGroup>

      <div className="flex flex-col gap-4">
        {days.map((day, dayIndex) => (
          <Card key={day.uid}>
            <CardHeader className="flex-row items-end justify-between gap-2">
              <Field className="flex-1">
                <FieldLabel htmlFor={`day-name-${day.uid}`}>Naziv dana</FieldLabel>
                <Input
                  id={`day-name-${day.uid}`}
                  placeholder="npr. Dan 1"
                  value={day.dayName}
                  onChange={(event) => handleDayNameChange(dayIndex, event.target.value)}
                  required
                />
              </Field>
              {days.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveDay(dayIndex)}
                >
                  <Trash2 />
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {day.exercises.map((exercise, exerciseIndex) => (
                <div
                  key={exercise.uid}
                  className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-end"
                >
                  <Field className="flex-1">
                    <FieldLabel htmlFor={`exercise-${exercise.uid}`}>Vežba</FieldLabel>
                    <Select
                      value={exercise.exercise}
                      onValueChange={(value) =>
                        handleExerciseFieldChange(dayIndex, exerciseIndex, "exercise", value)
                      }
                    >
                      <SelectTrigger id={`exercise-${exercise.uid}`}>
                        <SelectValue placeholder="Izaberi vežbu" />
                      </SelectTrigger>
                      <SelectContent>
                        {exercises.map((item) => (
                          <SelectItem key={item._id} value={item._id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field className="w-full sm:w-24">
                    <FieldLabel htmlFor={`sets-${exercise.uid}`}>Serije</FieldLabel>
                    <Input
                      id={`sets-${exercise.uid}`}
                      type="number"
                      min={0}
                      value={exercise.targetSets}
                      onChange={(event) =>
                        handleExerciseFieldChange(
                          dayIndex,
                          exerciseIndex,
                          "targetSets",
                          event.target.value
                        )
                      }
                    />
                  </Field>
                  <Field className="w-full sm:w-24">
                    <FieldLabel htmlFor={`reps-${exercise.uid}`}>Ponavljanja</FieldLabel>
                    <Input
                      id={`reps-${exercise.uid}`}
                      type="number"
                      min={0}
                      value={exercise.targetReps}
                      onChange={(event) =>
                        handleExerciseFieldChange(
                          dayIndex,
                          exerciseIndex,
                          "targetReps",
                          event.target.value
                        )
                      }
                    />
                  </Field>
                  {day.exercises.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveExercise(dayIndex, exerciseIndex)}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddExercise(dayIndex)}
                disabled={isLoadingExercises}
              >
                <Plus />
                Dodaj vežbu
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <Button type="button" variant="outline" onClick={handleAddDay}>
          <Plus />
          Dodaj dan
        </Button>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Čuvanje..." : isEditing ? "Sačuvaj izmene" : "Kreiraj plan"}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Otkaži
        </Button>
      </div>
    </form>
  )
}
