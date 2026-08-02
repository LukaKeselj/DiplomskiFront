import { useState } from "react"
import { useNavigate } from "react-router"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
import { Plus, Trash2 } from "lucide-react"

import { createNutritionPlanRequest, updateNutritionPlanRequest } from "@/api/nutritionPlans"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

let uidCounter = 0
function nextUid() {
  uidCounter += 1
  return `new-${uidCounter}`
}

function emptyItem() {
  return { uid: nextUid(), foodName: "", calories: "", protein: "", fat: "", carbs: "", fiber: "" }
}

function emptyDay(dayNumber, t) {
  return {
    uid: nextUid(),
    dayName: t("nutrition.planForm.defaultDayName", { number: dayNumber }),
    items: [emptyItem()],
  }
}

function daysFromPlan(plan, t) {
  if (!plan?.days?.length) return [emptyDay(1, t)]

  return plan.days.map((day) => ({
    uid: day._id ?? nextUid(),
    dayName: day.dayName ?? "",
    items: day.items?.length
      ? day.items.map((item) => ({
          uid: item._id ?? nextUid(),
          foodName: item.foodName ?? "",
          calories: item.calories?.toString() ?? "",
          protein: item.protein?.toString() ?? "",
          fat: item.fat?.toString() ?? "",
          carbs: item.carbs?.toString() ?? "",
          fiber: item.fiber?.toString() ?? "",
        }))
      : [emptyItem()],
  }))
}

export function NutritionPlanForm({ plan }) {
  const { t } = useTranslation()
  const isEditing = Boolean(plan)
  const navigate = useNavigate()
  const [name, setName] = useState(plan?.name ?? "")
  const [days, setDays] = useState(() => daysFromPlan(plan, t))
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleDayNameChange(dayIndex, value) {
    setDays((prev) =>
      prev.map((day, index) => (index === dayIndex ? { ...day, dayName: value } : day))
    )
  }

  function handleAddDay() {
    setDays((prev) => [...prev, emptyDay(prev.length + 1, t)])
  }

  function handleRemoveDay(dayIndex) {
    setDays((prev) => prev.filter((_, index) => index !== dayIndex))
  }

  function handleAddItem(dayIndex) {
    setDays((prev) =>
      prev.map((day, index) =>
        index === dayIndex ? { ...day, items: [...day.items, emptyItem()] } : day
      )
    )
  }

  function handleRemoveItem(dayIndex, itemIndex) {
    setDays((prev) =>
      prev.map((day, index) =>
        index === dayIndex
          ? { ...day, items: day.items.filter((_, i) => i !== itemIndex) }
          : day
      )
    )
  }

  function handleItemFieldChange(dayIndex, itemIndex, field, value) {
    setDays((prev) =>
      prev.map((day, index) =>
        index === dayIndex
          ? {
              ...day,
              items: day.items.map((item, i) => (i === itemIndex ? { ...item, [field]: value } : item)),
            }
          : day
      )
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!name.trim()) {
      toast.error(t("nutrition.planForm.planNameRequired"))
      return
    }
    if (days.some((day) => !day.dayName.trim())) {
      toast.error(t("nutrition.planForm.dayNameRequired"))
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
      toast.error(t("nutrition.planForm.itemValidation"))
      return
    }

    const payload = {
      name: name.trim(),
      days: days.map((day) => ({
        dayName: day.dayName.trim(),
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

      toast.success(isEditing ? t("nutrition.planForm.updateSuccess") : t("nutrition.planForm.createSuccess"))
      navigate(`/nutrition-plans/${savedPlan._id}`)
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(t("nutrition.planForm.updateForbidden"))
      } else {
        toast.error(error.response?.data?.message || t("nutrition.planForm.saveFailed"))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="nutrition-plan-name">{t("nutrition.planForm.planNameLabel")}</FieldLabel>
          <Input
            id="nutrition-plan-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </Field>
      </FieldGroup>

      <p className="text-sm text-muted-foreground">
        {t("nutrition.planForm.cycleNote", {
          dayName: days[0]?.dayName || t("nutrition.planForm.defaultDayNameFallback"),
        })}
      </p>

      <div className="flex flex-col gap-4">
        {days.map((day, dayIndex) => (
          <Card key={day.uid}>
            <CardHeader className="flex-row items-end justify-between gap-2">
              <Field className="flex-1">
                <FieldLabel htmlFor={`day-name-${day.uid}`}>{t("nutrition.planForm.dayNameLabel")}</FieldLabel>
                <Input
                  id={`day-name-${day.uid}`}
                  placeholder={t("nutrition.planForm.dayNamePlaceholder")}
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
              {day.items.map((item, itemIndex) => (
                <div
                  key={item.uid}
                  className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-end"
                >
                  <Field className="flex-1">
                    <FieldLabel htmlFor={`food-name-${item.uid}`}>{t("nutrition.planForm.foodNameLabel")}</FieldLabel>
                    <Input
                      id={`food-name-${item.uid}`}
                      value={item.foodName}
                      onChange={(event) =>
                        handleItemFieldChange(dayIndex, itemIndex, "foodName", event.target.value)
                      }
                    />
                  </Field>
                  <Field className="w-full sm:w-20">
                    <FieldLabel htmlFor={`calories-${item.uid}`}>{t("nutrition.planForm.caloriesLabel")}</FieldLabel>
                    <Input
                      id={`calories-${item.uid}`}
                      type="number"
                      step="0.1"
                      value={item.calories}
                      onChange={(event) =>
                        handleItemFieldChange(dayIndex, itemIndex, "calories", event.target.value)
                      }
                    />
                  </Field>
                  <Field className="w-full sm:w-20">
                    <FieldLabel htmlFor={`protein-${item.uid}`}>{t("nutrition.planForm.proteinLabel")}</FieldLabel>
                    <Input
                      id={`protein-${item.uid}`}
                      type="number"
                      step="0.1"
                      value={item.protein}
                      onChange={(event) =>
                        handleItemFieldChange(dayIndex, itemIndex, "protein", event.target.value)
                      }
                    />
                  </Field>
                  <Field className="w-full sm:w-20">
                    <FieldLabel htmlFor={`fat-${item.uid}`}>{t("nutrition.planForm.fatLabel")}</FieldLabel>
                    <Input
                      id={`fat-${item.uid}`}
                      type="number"
                      step="0.1"
                      value={item.fat}
                      onChange={(event) =>
                        handleItemFieldChange(dayIndex, itemIndex, "fat", event.target.value)
                      }
                    />
                  </Field>
                  <Field className="w-full sm:w-20">
                    <FieldLabel htmlFor={`carbs-${item.uid}`}>{t("nutrition.planForm.carbsLabel")}</FieldLabel>
                    <Input
                      id={`carbs-${item.uid}`}
                      type="number"
                      step="0.1"
                      value={item.carbs}
                      onChange={(event) =>
                        handleItemFieldChange(dayIndex, itemIndex, "carbs", event.target.value)
                      }
                    />
                  </Field>
                  <Field className="w-full sm:w-20">
                    <FieldLabel htmlFor={`fiber-${item.uid}`}>{t("nutrition.planForm.fiberLabel")}</FieldLabel>
                    <Input
                      id={`fiber-${item.uid}`}
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={item.fiber}
                      onChange={(event) =>
                        handleItemFieldChange(dayIndex, itemIndex, "fiber", event.target.value)
                      }
                    />
                  </Field>
                  {day.items.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveItem(dayIndex, itemIndex)}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => handleAddItem(dayIndex)}>
                <Plus />
                {t("nutrition.planForm.addFoodItem")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <Button type="button" variant="outline" onClick={handleAddDay}>
          <Plus />
          {t("nutrition.planForm.addDay")}
        </Button>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t("nutrition.planForm.saving")
            : isEditing
              ? t("nutrition.planForm.saveChanges")
              : t("nutrition.planForm.createPlan")}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          {t("nutrition.planForm.cancel")}
        </Button>
      </div>
    </form>
  )
}
