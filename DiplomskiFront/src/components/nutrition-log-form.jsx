import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
import { Search } from "lucide-react"

import {
  createNutritionLogRequest,
  getFoodDetailsRequest,
  searchFoodRequest,
  updateNutritionLogRequest,
} from "@/api/nutrition"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function round(value) {
  return Math.round(value * 10) / 10
}

function parseServingGrams(description) {
  if (!description) return null

  const gramMatch = description.match(/(\d+(?:[.,]\d+)?)\s*g\b/i)
  if (gramMatch) return parseFloat(gramMatch[1].replace(",", "."))

  const ounceMatch = description.match(/(\d+(?:[.,]\d+)?)\s*oz\b/i)
  if (ounceMatch) return parseFloat(ounceMatch[1].replace(",", ".")) * 28.3495

  return null
}

export function NutritionLogForm({ date, entry, onSaved, onCancel }) {
  const { t } = useTranslation()
  const isEditing = Boolean(entry)

  const [mode, setMode] = useState(isEditing ? "manual" : "search")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState([])

  const [selectedFood, setSelectedFood] = useState(null)
  const [isLoadingServings, setIsLoadingServings] = useState(false)
  const [servings, setServings] = useState([])
  const [selectedServingId, setSelectedServingId] = useState("")
  const [amount, setAmount] = useState("")

  const [manualForm, setManualForm] = useState({
    name: entry?.foodName ?? "",
    calories: entry?.calories?.toString() ?? "",
    protein: entry?.protein?.toString() ?? "",
    fat: entry?.fat?.toString() ?? "",
    carbs: entry?.carbs?.toString() ?? "",
    fiber: entry?.fiber?.toString() ?? "",
  })

  const trimmedQuery = query.trim()
  const visibleResults = trimmedQuery ? results : []

  useEffect(() => {
    if (mode !== "search" || selectedFood || !trimmedQuery) return

    const timeoutId = setTimeout(() => {
      setIsSearching(true)
      searchFoodRequest(trimmedQuery)
        .then(setResults)
        .catch((error) => {
          toast.error(error.response?.data?.message || t("nutrition.logForm.searchFailed"))
        })
        .finally(() => setIsSearching(false))
    }, 400)

    return () => clearTimeout(timeoutId)
  }, [trimmedQuery, mode, selectedFood, t])

  function handleSelectFood(food) {
    setSelectedFood(food)
    setResults([])
    setSelectedServingId("")
    setIsLoadingServings(true)
    getFoodDetailsRequest(food.foodId)
      .then((data) => setServings(data.servings ?? []))
      .catch((error) => {
        toast.error(error.response?.data?.message || t("nutrition.logForm.foodDetailsFailed"))
      })
      .finally(() => setIsLoadingServings(false))
  }

  function handleChangeFood() {
    setSelectedFood(null)
    setServings([])
    setSelectedServingId("")
    setQuery("")
  }

  function handleSelectServing(serving) {
    setSelectedServingId(serving.servingId)
    const grams = parseServingGrams(serving.description)
    setAmount(grams ? String(grams) : "1")
  }

  function handleManualChange(field) {
    return (event) => setManualForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  async function submit(payload) {
    setIsSubmitting(true)
    try {
      let saved
      if (isEditing) {
        saved = await updateNutritionLogRequest(entry._id, payload)
        toast.success(t("nutrition.logForm.updateSuccess"))
      } else {
        saved = await createNutritionLogRequest(payload)
        toast.success(t("nutrition.logForm.createSuccess"))
      }
      onSaved(saved)
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(t("nutrition.logForm.updateForbidden"))
      } else {
        toast.error(error.response?.data?.message || t("nutrition.logForm.saveFailed"))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedServing = servings.find((serving) => serving.servingId === selectedServingId)
  const servingGrams = selectedServing ? parseServingGrams(selectedServing.description) : null
  const amountNumber = Number(amount)
  const ratio = servingGrams ? amountNumber / servingGrams : amountNumber
  const computed =
    selectedServing && ratio > 0
      ? {
          calories: round(selectedServing.calories * ratio),
          protein: round(selectedServing.protein * ratio),
          fat: round(selectedServing.fat * ratio),
          carbs: round(selectedServing.carbs * ratio),
          fiber: round((selectedServing.fiber ?? 0) * ratio),
        }
      : null

  function handleSearchSubmit(event) {
    event.preventDefault()

    if (!selectedFood || !selectedServing) {
      toast.error(t("nutrition.logForm.selectFoodAndServing"))
      return
    }
    if (!(ratio > 0)) {
      toast.error(
        servingGrams
          ? t("nutrition.logForm.gramsMustBePositive")
          : t("nutrition.logForm.amountMustBePositive")
      )
      return
    }

    submit({
      date,
      foodName: selectedFood.name,
      foodId: selectedFood.foodId,
      ...computed,
    })
  }

  function handleManualSubmit(event) {
    event.preventDefault()

    if (!manualForm.name.trim()) {
      toast.error(t("nutrition.logForm.nameRequired"))
      return
    }

    const calories = Number(manualForm.calories)
    const protein = Number(manualForm.protein)
    const fat = Number(manualForm.fat)
    const carbs = Number(manualForm.carbs)
    const fiber = manualForm.fiber.trim() ? Number(manualForm.fiber) : 0

    if ([calories, protein, fat, carbs, fiber].some((value) => Number.isNaN(value))) {
      toast.error(t("nutrition.logForm.numbersRequired"))
      return
    }

    submit({
      date,
      foodName: manualForm.name.trim(),
      calories,
      protein,
      fat,
      carbs,
      fiber,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {!isEditing && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant={mode === "search" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("search")}
          >
            {t("nutrition.logForm.searchTab")}
          </Button>
          <Button
            type="button"
            variant={mode === "manual" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("manual")}
          >
            {t("nutrition.logForm.manualTab")}
          </Button>
        </div>
      )}

      {mode === "search" ? (
        <form className="flex flex-col gap-4" onSubmit={handleSearchSubmit}>
          {!selectedFood ? (
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="nutrition-food-search">{t("nutrition.logForm.searchLabel")}</FieldLabel>
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="nutrition-food-search"
                    className="pl-8"
                    placeholder={t("nutrition.logForm.searchPlaceholder")}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
              </Field>
              {trimmedQuery && isSearching ? (
                <p className="text-sm text-muted-foreground">{t("nutrition.logForm.searching")}</p>
              ) : visibleResults.length > 0 ? (
                <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
                  {visibleResults.map((food) => (
                    <button
                      key={food.foodId}
                      type="button"
                      onClick={() => handleSelectFood(food)}
                      className="flex flex-col gap-0.5 rounded-lg border border-border p-2.5 text-left transition-colors hover:bg-muted"
                    >
                      <span className="text-sm font-medium">{food.name}</span>
                      <span className="text-xs text-muted-foreground">{food.description}</span>
                    </button>
                  ))}
                </div>
              ) : trimmedQuery ? (
                <p className="text-sm text-muted-foreground">{t("nutrition.logForm.noResults")}</p>
              ) : null}
            </FieldGroup>
          ) : (
            <FieldGroup>
              <Field orientation="horizontal">
                <FieldLabel className="flex-1">{selectedFood.name}</FieldLabel>
                <Button type="button" variant="outline" size="sm" onClick={handleChangeFood}>
                  {t("nutrition.logForm.changeFood")}
                </Button>
              </Field>

              {isLoadingServings ? (
                <p className="text-sm text-muted-foreground">{t("nutrition.logForm.loadingServings")}</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>{t("nutrition.logForm.servingLabel")}</FieldLabel>
                    <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
                      {servings.map((serving) => (
                        <button
                          key={serving.servingId}
                          type="button"
                          onClick={() => handleSelectServing(serving)}
                          className={cn(
                            "rounded-lg border p-2.5 text-left text-sm transition-colors hover:bg-muted",
                            serving.servingId === selectedServingId
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          )}
                        >
                          {serving.description} — {serving.calories} kcal
                        </button>
                      ))}
                    </div>
                  </Field>

                  {selectedServing && (
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="nutrition-amount">
                          {servingGrams
                            ? t("nutrition.logForm.gramsLabel")
                            : t("nutrition.logForm.servingCountLabel")}
                        </FieldLabel>
                        <Input
                          id="nutrition-amount"
                          type="number"
                          min="0"
                          step="0.1"
                          value={amount}
                          onChange={(event) => setAmount(event.target.value)}
                        />
                        {!servingGrams && (
                          <p className="text-xs text-muted-foreground">
                            {t("nutrition.logForm.noGramsHint")}
                          </p>
                        )}
                      </Field>

                      {computed && (
                        <div className="grid grid-cols-5 gap-2 rounded-lg bg-muted/50 p-2.5 text-center text-xs">
                          <div>
                            <div className="font-medium">{computed.calories}</div>
                            <div className="text-muted-foreground">kcal</div>
                          </div>
                          <div>
                            <div className="font-medium">{computed.protein}g</div>
                            <div className="text-muted-foreground">{t("nutrition.logForm.computed.protein")}</div>
                          </div>
                          <div>
                            <div className="font-medium">{computed.fat}g</div>
                            <div className="text-muted-foreground">{t("nutrition.logForm.computed.fat")}</div>
                          </div>
                          <div>
                            <div className="font-medium">{computed.carbs}g</div>
                            <div className="text-muted-foreground">{t("nutrition.logForm.computed.carbs")}</div>
                          </div>
                          <div>
                            <div className="font-medium">{computed.fiber}g</div>
                            <div className="text-muted-foreground">{t("nutrition.logForm.computed.fiber")}</div>
                          </div>
                        </div>
                      )}
                    </FieldGroup>
                  )}
                </div>
              )}
            </FieldGroup>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || !selectedServing}>
              {isSubmitting ? t("nutrition.logForm.saving") : t("nutrition.logForm.addEntry")}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              {t("nutrition.logForm.cancel")}
            </Button>
          </div>
        </form>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleManualSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="nutrition-manual-name">{t("nutrition.logForm.manualNameLabel")}</FieldLabel>
              <Input
                id="nutrition-manual-name"
                value={manualForm.name}
                onChange={handleManualChange("name")}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="nutrition-manual-calories">{t("nutrition.logForm.manualCaloriesLabel")}</FieldLabel>
                <Input
                  id="nutrition-manual-calories"
                  type="number"
                  step="0.1"
                  value={manualForm.calories}
                  onChange={handleManualChange("calories")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="nutrition-manual-protein">{t("nutrition.logForm.manualProteinLabel")}</FieldLabel>
                <Input
                  id="nutrition-manual-protein"
                  type="number"
                  step="0.1"
                  value={manualForm.protein}
                  onChange={handleManualChange("protein")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="nutrition-manual-fat">{t("nutrition.logForm.manualFatLabel")}</FieldLabel>
                <Input
                  id="nutrition-manual-fat"
                  type="number"
                  step="0.1"
                  value={manualForm.fat}
                  onChange={handleManualChange("fat")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="nutrition-manual-carbs">{t("nutrition.logForm.manualCarbsLabel")}</FieldLabel>
                <Input
                  id="nutrition-manual-carbs"
                  type="number"
                  step="0.1"
                  value={manualForm.carbs}
                  onChange={handleManualChange("carbs")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="nutrition-manual-fiber">{t("nutrition.logForm.manualFiberLabel")}</FieldLabel>
                <Input
                  id="nutrition-manual-fiber"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={manualForm.fiber}
                  onChange={handleManualChange("fiber")}
                />
              </Field>
            </div>
          </FieldGroup>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t("nutrition.logForm.saving")
                : isEditing
                  ? t("nutrition.logForm.saveChanges")
                  : t("nutrition.logForm.addEntry")}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              {t("nutrition.logForm.cancel")}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
