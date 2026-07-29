import { useState } from "react"
import { useNavigate } from "react-router"
import toast from "react-hot-toast"
import { Plus, Trash2 } from "lucide-react"

import { createNutritionPlanRequest, updateNutritionPlanRequest } from "@/api/nutritionPlans"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { DAYS_OF_WEEK_DISPLAY_ORDER, DAYS_OF_WEEK } from "@/lib/days-of-week"

let uidCounter = 0
function nextUid() {
  uidCounter += 1
  return `new-${uidCounter}`
}

function emptyItem() {
  return { uid: nextUid(), foodName: "", calories: "", protein: "", fat: "", carbs: "", fiber: "" }
}

function daysFromPlan(plan) {
  const byDayOfWeek = new Map((plan?.days ?? []).map((day) => [day.dayOfWeek, day]))

  return DAYS_OF_WEEK.map(({ value }) => {
    const day = byDayOfWeek.get(value)
    return {
      dayOfWeek: value,
      items: (day?.items ?? []).map((item) => ({
        uid: item._id ?? nextUid(),
        foodName: item.foodName ?? "",
        calories: item.calories?.toString() ?? "",
        protein: item.protein?.toString() ?? "",
        fat: item.fat?.toString() ?? "",
        carbs: item.carbs?.toString() ?? "",
        fiber: item.fiber?.toString() ?? "",
      })),
    }
  })
}

const dayLabelByValue = new Map(DAYS_OF_WEEK.map((d) => [d.value, d.label]))

export function NutritionPlanForm({ plan }) {
  const isEditing = Boolean(plan)
  const navigate = useNavigate()
  const [name, setName] = useState(plan?.name ?? "")
  const [days, setDays] = useState(() => daysFromPlan(plan))
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleAddItem(dayOfWeek) {
    setDays((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, items: [...day.items, emptyItem()] } : day
      )
    )
  }

  function handleRemoveItem(dayOfWeek, uid) {
    setDays((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? { ...day, items: day.items.filter((item) => item.uid !== uid) }
          : day
      )
    )
  }

  function handleItemFieldChange(dayOfWeek, uid, field, value) {
    setDays((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? {
              ...day,
              items: day.items.map((item) =>
                item.uid === uid ? { ...item, [field]: value } : item
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

    const invalidItem = days
      .flatMap((day) => day.items)
      .find((item) => {
        if (!item.foodName.trim()) return true
        const values = [item.calories, item.protein, item.fat, item.carbs]
        return values.some((value) => value === "" || Number.isNaN(Number(value)))
      })

    if (invalidItem) {
      toast.error("Svaka namirnica mora imati naziv, kalorije, proteine, masti i ugljene hidrate")
      return
    }

    const payload = {
      name: name.trim(),
      days: days.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        items: day.items.map((item) => ({
          foodName: item.foodName.trim(),
          calories: Number(item.calories),
          protein: Number(item.protein),
          fat: Number(item.fat),
          carbs: Number(item.carbs),
          fiber: item.fiber.trim() ? Number(item.fiber) : 0,
        })),
      })),
    }

    setIsSubmitting(true)
    try {
      const savedPlan = isEditing
        ? await updateNutritionPlanRequest(plan._id, payload)
        : await createNutritionPlanRequest(payload)

      toast.success(isEditing ? "Plan je ažuriran" : "Plan je kreiran")
      navigate(`/nutrition-plans/${savedPlan._id}`)
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
          <FieldLabel htmlFor="nutrition-plan-name">Naziv plana</FieldLabel>
          <Input
            id="nutrition-plan-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </Field>
      </FieldGroup>

      <div className="flex flex-col gap-4">
        {DAYS_OF_WEEK_DISPLAY_ORDER.map((dayOfWeek) => {
          const day = days.find((d) => d.dayOfWeek === dayOfWeek)
          return (
            <Card key={dayOfWeek}>
              <CardHeader>
                <CardTitle>{dayLabelByValue.get(dayOfWeek)}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {day.items.map((item) => (
                  <div
                    key={item.uid}
                    className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-end"
                  >
                    <Field className="flex-1">
                      <FieldLabel htmlFor={`food-name-${item.uid}`}>Namirnica</FieldLabel>
                      <Input
                        id={`food-name-${item.uid}`}
                        value={item.foodName}
                        onChange={(event) =>
                          handleItemFieldChange(dayOfWeek, item.uid, "foodName", event.target.value)
                        }
                      />
                    </Field>
                    <Field className="w-full sm:w-20">
                      <FieldLabel htmlFor={`calories-${item.uid}`}>Kcal</FieldLabel>
                      <Input
                        id={`calories-${item.uid}`}
                        type="number"
                        step="0.1"
                        value={item.calories}
                        onChange={(event) =>
                          handleItemFieldChange(dayOfWeek, item.uid, "calories", event.target.value)
                        }
                      />
                    </Field>
                    <Field className="w-full sm:w-20">
                      <FieldLabel htmlFor={`protein-${item.uid}`}>Protein (g)</FieldLabel>
                      <Input
                        id={`protein-${item.uid}`}
                        type="number"
                        step="0.1"
                        value={item.protein}
                        onChange={(event) =>
                          handleItemFieldChange(dayOfWeek, item.uid, "protein", event.target.value)
                        }
                      />
                    </Field>
                    <Field className="w-full sm:w-20">
                      <FieldLabel htmlFor={`fat-${item.uid}`}>Masti (g)</FieldLabel>
                      <Input
                        id={`fat-${item.uid}`}
                        type="number"
                        step="0.1"
                        value={item.fat}
                        onChange={(event) =>
                          handleItemFieldChange(dayOfWeek, item.uid, "fat", event.target.value)
                        }
                      />
                    </Field>
                    <Field className="w-full sm:w-20">
                      <FieldLabel htmlFor={`carbs-${item.uid}`}>UH (g)</FieldLabel>
                      <Input
                        id={`carbs-${item.uid}`}
                        type="number"
                        step="0.1"
                        value={item.carbs}
                        onChange={(event) =>
                          handleItemFieldChange(dayOfWeek, item.uid, "carbs", event.target.value)
                        }
                      />
                    </Field>
                    <Field className="w-full sm:w-20">
                      <FieldLabel htmlFor={`fiber-${item.uid}`}>Vlakna (g)</FieldLabel>
                      <Input
                        id={`fiber-${item.uid}`}
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={item.fiber}
                        onChange={(event) =>
                          handleItemFieldChange(dayOfWeek, item.uid, "fiber", event.target.value)
                        }
                      />
                    </Field>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveItem(dayOfWeek, item.uid)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddItem(dayOfWeek)}
                >
                  <Plus />
                  Dodaj namirnicu
                </Button>
              </CardContent>
            </Card>
          )
        })}
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
