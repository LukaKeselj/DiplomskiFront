import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import toast from "react-hot-toast"
import { Apple } from "lucide-react"

import { deleteNutritionLogRequest, getNutritionLogsRequest } from "@/api/nutrition"
import { confirmNutritionPlanItemRequest, getActiveNutritionPlanRequest } from "@/api/nutritionPlans"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { getNutritionPlanDayForDate } from "@/lib/nutrition-cycle"

function todayDateString() {
  return new Date().toISOString().slice(0, 10)
}

export function HomeNutritionWidget() {
  const { user } = useAuth()
  const today = useMemo(() => todayDateString(), [])
  const [plan, setPlan] = useState(null)
  const [confirmedByItem, setConfirmedByItem] = useState({})
  const [isLoading, setIsLoading] = useState(Boolean(user?.activeNutritionPlan))
  const [pendingItemId, setPendingItemId] = useState(null)

  useEffect(() => {
    if (!user?.activeNutritionPlan) return

    Promise.all([getActiveNutritionPlanRequest(), getNutritionLogsRequest(today)])
      .then(([planData, logsData]) => {
        setPlan(planData)
        const map = {}
        logsData.forEach((log) => {
          if (log.nutritionPlanItem) map[log.nutritionPlanItem] = log._id
        })
        setConfirmedByItem(map)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [user?.activeNutritionPlan, today])

  const todayItems = useMemo(() => {
    if (!plan) return []
    return getNutritionPlanDayForDate(plan, user?.activeNutritionPlanStartDate, today)?.items ?? []
  }, [plan, user?.activeNutritionPlanStartDate, today])

  const confirmedCount = todayItems.filter((item) => confirmedByItem[item._id]).length
  const progress = todayItems.length > 0 ? (confirmedCount / todayItems.length) * 100 : 0

  async function handleToggle(item, checked) {
    setPendingItemId(item._id)
    try {
      if (checked) {
        const log = await confirmNutritionPlanItemRequest(plan._id, {
          item: item._id,
          date: today,
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
    } catch (error) {
      toast.error(error.response?.data?.message || "Čuvanje nije uspelo")
    } finally {
      setPendingItemId(null)
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Apple className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-medium">Ishrana danas</p>
            <p className="truncate text-xs text-muted-foreground">
              {plan?.name ?? "Nema aktivnog plana"}
            </p>
          </div>
          {todayItems.length > 0 && (
            <span className="shrink-0 text-xs font-medium text-muted-foreground">
              {confirmedCount}/{todayItems.length}
            </span>
          )}
        </div>
        {todayItems.length > 0 && (
          <Progress
            value={progress}
            className="mt-3 [&>[data-slot=progress-indicator]]:bg-orange-500"
          />
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Učitavanje...</p>
        ) : !plan ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-8 text-center">
            <p className="text-sm text-muted-foreground">Nemaš aktivan plan ishrane</p>
            <Button size="sm" variant="outline" asChild>
              <Link to="/nutrition-plans">Izaberi plan</Link>
            </Button>
          </div>
        ) : todayItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nema planiranih namirnica za danas</p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {todayItems.map((item) => {
              const confirmed = Boolean(confirmedByItem[item._id])
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
                  <span className={cn("truncate", confirmed && "text-muted-foreground line-through")}>
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
      </CardContent>
    </Card>
  )
}
