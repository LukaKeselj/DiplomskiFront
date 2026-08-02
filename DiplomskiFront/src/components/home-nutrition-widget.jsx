import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
import { Apple, Plus, Trash2 } from "lucide-react"

import { deleteNutritionLogRequest, getNutritionLogsRequest } from "@/api/nutrition"
import { confirmNutritionPlanItemRequest, getActiveNutritionPlanRequest } from "@/api/nutritionPlans"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { NutritionLogForm } from "@/components/nutrition-log-form"
import { useAuth } from "@/context/AuthContext"
import { cn, formatFullDateLabel } from "@/lib/utils"
import { getNutritionPlanDayForDate, isBeforeActivation } from "@/lib/nutrition-cycle"

function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function HomeNutritionWidget({ date, onLogChange }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const selectedDate = useMemo(() => date ?? new Date(), [date])
  const dateKey = useMemo(() => toDateKey(selectedDate), [selectedDate])
  const todayKey = useMemo(() => toDateKey(new Date()), [])
  const isToday = dateKey === todayKey
  const isFuture = dateKey > todayKey

  const [plan, setPlan] = useState(null)
  const [confirmedByItem, setConfirmedByItem] = useState({})
  const [extraEntries, setExtraEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pendingItemId, setPendingItemId] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    const planPromise = user?.activeNutritionPlan
      ? getActiveNutritionPlanRequest()
      : Promise.resolve(null)

    Promise.all([planPromise, getNutritionLogsRequest(dateKey)])
      .then(([planData, logsData]) => {
        if (cancelled) return
        setPlan(planData)
        const map = {}
        const extras = []
        logsData.forEach((log) => {
          if (log.nutritionPlanItem) {
            map[log.nutritionPlanItem] = log._id
          } else {
            extras.push(log)
          }
        })
        setConfirmedByItem(map)
        setExtraEntries(extras)
      })
      .catch(() => {})
      .finally(() => !cancelled && setIsLoading(false))

    return () => {
      cancelled = true
    }
  }, [user?.activeNutritionPlan, dateKey])

  const dayItems = useMemo(() => {
    if (!plan || isBeforeActivation(user?.activeNutritionPlanStartDate, selectedDate)) return []
    return getNutritionPlanDayForDate(plan, user?.activeNutritionPlanStartDate, selectedDate)
      ?.items ?? []
  }, [plan, user?.activeNutritionPlanStartDate, selectedDate])

  const confirmedCount = dayItems.filter((item) => confirmedByItem[item._id]).length
  const progress = dayItems.length > 0 ? (confirmedCount / dayItems.length) * 100 : 0

  async function handleToggle(item, checked) {
    setPendingItemId(item._id)
    try {
      if (checked) {
        const log = await confirmNutritionPlanItemRequest(plan._id, {
          item: item._id,
          date: dateKey,
        })
        setConfirmedByItem((prev) => ({ ...prev, [item._id]: log._id }))
      } else {
        const logId = confirmedByItem[item._id]
        if (logId) {
          await deleteNutritionLogRequest(logId)
          setConfirmedByItem((prev) => {
            const next = { ...prev }
            delete next[item._id]
            return next
          })
        }
      }
      onLogChange?.()
    } catch (error) {
      toast.error(error.response?.data?.message || t("home.nutritionWidget.toasts.saveError"))
    } finally {
      setPendingItemId(null)
    }
  }

  async function handleDeleteExtra(logId) {
    try {
      await deleteNutritionLogRequest(logId)
      setExtraEntries((prev) => prev.filter((entry) => entry._id !== logId))
      onLogChange?.()
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(t("home.nutritionWidget.toasts.deleteNoPermission"))
      } else {
        toast.error(error.response?.data?.message || t("home.nutritionWidget.toasts.deleteError"))
      }
    }
  }

  function handleExtraSaved(savedLog) {
    setIsFormOpen(false)
    setExtraEntries((prev) => [...prev, savedLog])
    onLogChange?.()
  }

  return (
    <Card className="flex h-80 flex-col overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Apple className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-medium">
              {isToday
                ? t("home.nutritionWidget.titleToday")
                : t("home.nutritionWidget.titleForDate", { date: formatFullDateLabel(selectedDate) })}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {plan?.name ?? t("home.nutritionWidget.noPlanLabel")}
            </p>
          </div>
          {dayItems.length > 0 && (
            <span className="shrink-0 text-xs font-medium text-muted-foreground">
              {confirmedCount}/{dayItems.length}
            </span>
          )}
        </div>
        {dayItems.length > 0 && (
          <Progress
            value={progress}
            className="mt-3 [&>[data-slot=progress-indicator]]:bg-orange-500"
          />
        )}
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
              {!plan ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-8 text-center">
                  <p className="text-sm text-muted-foreground">{t("home.nutritionWidget.noPlan")}</p>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/nutrition-plans">{t("home.nutritionWidget.noPlanCta")}</Link>
                  </Button>
                </div>
              ) : dayItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("home.nutritionWidget.noItemsForDay")}
                </p>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {dayItems.map((item) => {
                    const confirmed = Boolean(confirmedByItem[item._id])
                    if (isFuture) {
                      return (
                        <div
                          key={item._id}
                          className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-sm text-muted-foreground"
                        >
                          <span className="truncate">{item.foodName}</span>
                          <span className="ml-auto shrink-0 text-xs">{item.calories} kcal</span>
                        </div>
                      )
                    }

                    return (
                      <label
                        key={item._id}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-sm transition-colors hover:bg-muted/50",
                          pendingItemId === item._id && "opacity-60"
                        )}
                      >
                        <Checkbox
                          checked={confirmed}
                          disabled={pendingItemId === item._id}
                          onCheckedChange={(checked) => handleToggle(item, checked === true)}
                        />
                        <span
                          className={cn(
                            "truncate",
                            confirmed && "text-muted-foreground line-through"
                          )}
                        >
                          {item.foodName}
                        </span>
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                          {item.calories} kcal
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}

              {extraEntries.length > 0 && (
                <div className="flex flex-col gap-0.5">
                  {plan && (
                    <p className="px-1.5 text-xs font-medium text-muted-foreground">{t("home.nutritionWidget.extraLabel")}</p>
                  )}
                  {extraEntries.map((entry) => (
                    <div
                      key={entry._id}
                      className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-sm"
                    >
                      <span className="truncate">{entry.foodName}</span>
                      <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                        {entry.calories} kcal
                      </span>
                      {!isFuture && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteExtra(entry._id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!isFuture && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 self-start"
                onClick={() => setIsFormOpen(true)}
              >
                <Plus />
                {t("home.nutritionWidget.addFood")}
              </Button>
            )}
          </>
        )}
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("home.nutritionWidget.addFoodDialog.title")}</DialogTitle>
            <DialogDescription>{t("home.nutritionWidget.addFoodDialog.description")}</DialogDescription>
          </DialogHeader>
          {isFormOpen && (
            <NutritionLogForm
              date={dateKey}
              onSaved={handleExtraSaved}
              onCancel={() => setIsFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
