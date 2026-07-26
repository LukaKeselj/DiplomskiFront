import { useEffect, useState } from "react"
import toast from "react-hot-toast"
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
          toast.error(error.response?.data?.message || "Pretraga hrane nije uspela")
        })
        .finally(() => setIsSearching(false))
    }, 400)

    return () => clearTimeout(timeoutId)
  }, [trimmedQuery, mode, selectedFood])

  function handleSelectFood(food) {
    setSelectedFood(food)
    setResults([])
    setSelectedServingId("")
    setIsLoadingServings(true)
    getFoodDetailsRequest(food.foodId)
      .then((data) => setServings(data.servings ?? []))
      .catch((error) => {
        toast.error(error.response?.data?.message || "Učitavanje namirnice nije uspelo")
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
        toast.success("Unos je ažuriran")
      } else {
        saved = await createNutritionLogRequest(payload)
        toast.success("Unos je dodat u dnevnik")
      }
      onSaved(saved)
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
      toast.error("Izaberi namirnicu i porciju")
      return
    }
    if (!(ratio > 0)) {
      toast.error(servingGrams ? "Gramaža mora biti veća od 0" : "Količina mora biti veća od 0")
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
      toast.error("Naziv namirnice je obavezan")
      return
    }

    const calories = Number(manualForm.calories)
    const protein = Number(manualForm.protein)
    const fat = Number(manualForm.fat)
    const carbs = Number(manualForm.carbs)
    const fiber = manualForm.fiber.trim() ? Number(manualForm.fiber) : 0

    if ([calories, protein, fat, carbs, fiber].some((value) => Number.isNaN(value))) {
      toast.error("Kalorije, proteini, masti, ugljeni hidrati i vlakna moraju biti brojevi")
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
            Pretraga
          </Button>
          <Button
            type="button"
            variant={mode === "manual" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("manual")}
          >
            Ručni unos
          </Button>
        </div>
      )}

      {mode === "search" ? (
        <form className="flex flex-col gap-4" onSubmit={handleSearchSubmit}>
          {!selectedFood ? (
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="nutrition-food-search">Pretraga hrane</FieldLabel>
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="nutrition-food-search"
                    className="pl-8"
                    placeholder="npr. piletina, pirinač..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
              </Field>
              {trimmedQuery && isSearching ? (
                <p className="text-sm text-muted-foreground">Pretraga...</p>
              ) : visibleResults.length > 0 ? (
                <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
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
                <p className="text-sm text-muted-foreground">Nema rezultata</p>
              ) : null}
            </FieldGroup>
          ) : (
            <FieldGroup>
              <Field orientation="horizontal">
                <FieldLabel className="flex-1">{selectedFood.name}</FieldLabel>
                <Button type="button" variant="outline" size="sm" onClick={handleChangeFood}>
                  Promeni namirnicu
                </Button>
              </Field>

              {isLoadingServings ? (
                <p className="text-sm text-muted-foreground">Učitavanje porcija...</p>
              ) : (
                <Field>
                  <FieldLabel>Porcija</FieldLabel>
                  <div className="flex flex-col gap-1">
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
              )}

              {selectedServing && (
                <>
                  <Field>
                    <FieldLabel htmlFor="nutrition-amount">
                      {servingGrams ? "Gramaža (g)" : "Količina (broj porcija)"}
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
                        Ova porcija nema definisanu gramažu — unesi broj porcija (npr. 1.5).
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
                        <div className="text-muted-foreground">protein</div>
                      </div>
                      <div>
                        <div className="font-medium">{computed.fat}g</div>
                        <div className="text-muted-foreground">masti</div>
                      </div>
                      <div>
                        <div className="font-medium">{computed.carbs}g</div>
                        <div className="text-muted-foreground">UH</div>
                      </div>
                      <div>
                        <div className="font-medium">{computed.fiber}g</div>
                        <div className="text-muted-foreground">vlakna</div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </FieldGroup>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || !selectedServing}>
              {isSubmitting ? "Čuvanje..." : "Dodaj unos"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Otkaži
            </Button>
          </div>
        </form>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleManualSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="nutrition-manual-name">Naziv namirnice</FieldLabel>
              <Input
                id="nutrition-manual-name"
                value={manualForm.name}
                onChange={handleManualChange("name")}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="nutrition-manual-calories">Kalorije (kcal)</FieldLabel>
                <Input
                  id="nutrition-manual-calories"
                  type="number"
                  step="0.1"
                  value={manualForm.calories}
                  onChange={handleManualChange("calories")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="nutrition-manual-protein">Proteini (g)</FieldLabel>
                <Input
                  id="nutrition-manual-protein"
                  type="number"
                  step="0.1"
                  value={manualForm.protein}
                  onChange={handleManualChange("protein")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="nutrition-manual-fat">Masti (g)</FieldLabel>
                <Input
                  id="nutrition-manual-fat"
                  type="number"
                  step="0.1"
                  value={manualForm.fat}
                  onChange={handleManualChange("fat")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="nutrition-manual-carbs">Ugljeni hidrati (g)</FieldLabel>
                <Input
                  id="nutrition-manual-carbs"
                  type="number"
                  step="0.1"
                  value={manualForm.carbs}
                  onChange={handleManualChange("carbs")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="nutrition-manual-fiber">Vlakna (g)</FieldLabel>
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
              {isSubmitting ? "Čuvanje..." : isEditing ? "Sačuvaj izmene" : "Dodaj unos"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Otkaži
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
