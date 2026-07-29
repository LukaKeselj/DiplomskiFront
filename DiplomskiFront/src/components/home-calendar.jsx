import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import toast from "react-hot-toast"
import { Apple, CalendarDays, Dumbbell } from "lucide-react"
import { srLatn } from "date-fns/locale"

import { deleteNutritionLogRequest, getNutritionLogsRequest } from "@/api/nutrition"
import { confirmNutritionPlanItemRequest, getActiveNutritionPlanRequest } from "@/api/nutritionPlans"
import { getActiveWorkoutPlanRequest } from "@/api/workoutPlans"
import { getNextWorkoutDayRequest, getWorkoutSessionsRequest } from "@/api/workoutSessions"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/context/AuthContext"
import { cn, formatFullDateLabel } from "@/lib/utils"

function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function HomeCalendar() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [nutritionPlan, setNutritionPlan] = useState(null)
  const [nutritionLogs, setNutritionLogs] = useState([])
  const [workoutPlan, setWorkoutPlan] = useState(null)
  const [workoutSessions, setWorkoutSessions] = useState([])
  const [nextWorkoutDay, setNextWorkoutDay] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pendingItemId, setPendingItemId] = useState(null)

  const dateKey = useMemo(() => toDateKey(selectedDate), [selectedDate])
  const todayKey = useMemo(() => toDateKey(new Date()), [])
  const isToday = dateKey === todayKey
  const isFuture = dateKey > todayKey

  useEffect(() => {
    let cancelled = false

    Promise.all([
      user?.activeNutritionPlan ? getActiveNutritionPlanRequest() : Promise.resolve(null),
      getNutritionLogsRequest(dateKey),
      user?.activeWorkoutPlan ? getActiveWorkoutPlanRequest() : Promise.resolve(null),
      user?.activeWorkoutPlan ? getWorkoutSessionsRequest(user.activeWorkoutPlan) : Promise.resolve([]),
    ])
      .then(([planData, logsData, workoutPlanData, sessionsData]) => {
        if (cancelled) return
        setNutritionPlan(planData)
        setNutritionLogs(logsData)
        setWorkoutPlan(workoutPlanData)
        setWorkoutSessions(sessionsData)
      })
      .catch(() => {})
      .finally(() => !cancelled && setIsLoading(false))

    return () => {
      cancelled = true
    }
  }, [dateKey, user?.activeNutritionPlan, user?.activeWorkoutPlan])

  useEffect(() => {
    if (!isToday || !user?.activeWorkoutPlan) return
    getNextWorkoutDayRequest(user.activeWorkoutPlan)
      .then(setNextWorkoutDay)
      .catch(() => {})
  }, [isToday, user?.activeWorkoutPlan])

  const nutritionItems = useMemo(() => {
    if (!nutritionPlan) return []
    const dayOfWeek = selectedDate.getDay()
    return nutritionPlan.days.find((day) => day.dayOfWeek === dayOfWeek)?.items ?? []
  }, [nutritionPlan, selectedDate])

  const sessionForDate = useMemo(
    () => workoutSessions.find((session) => session.date.slice(0, 10) === dateKey),
    [workoutSessions, dateKey]
  )

  const completedDay = useMemo(() => {
    if (!sessionForDate || !workoutPlan) return null
    return workoutPlan.days.find((day) => day._id === sessionForDate.day) ?? null
  }, [sessionForDate, workoutPlan])

  async function handleToggleNutrition(item, checked) {
    if (!nutritionPlan) return
    setPendingItemId(item._id)
    try {
      if (checked) {
        const log = await confirmNutritionPlanItemRequest(nutritionPlan._id, {
          item: item._id,
          date: dateKey,
        })
        setNutritionLogs((prev) => [...prev, log])
      } else {
        const existing = nutritionLogs.find((log) => log.nutritionPlanItem === item._id)
        if (existing) {
          await deleteNutritionLogRequest(existing._id)
          setNutritionLogs((prev) => prev.filter((log) => log._id !== existing._id))
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Čuvanje nije uspelo")
    } finally {
      setPendingItemId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="size-4" />
          Kalendar
        </CardTitle>
        {!isToday && (
          <Button size="sm" variant="ghost" onClick={() => setSelectedDate(new Date())}>
            Danas
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4 md:flex-row">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          locale={srLatn}
          className="rounded-md border p-2"
        />
        <div className="flex flex-1 flex-col gap-4">
          <h3 className="text-sm font-medium">{formatFullDateLabel(selectedDate)}</h3>

          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium text-orange-600 dark:text-orange-400">
              <Apple className="size-3.5" />
              Ishrana
            </h4>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Učitavanje...</p>
            ) : !nutritionPlan ? (
              <div className="flex flex-col items-start gap-2">
                <p className="text-sm text-muted-foreground">Nemaš aktivan plan ishrane</p>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/nutrition-plans">Izaberi plan</Link>
                </Button>
              </div>
            ) : nutritionItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nema planiranih namirnica za ovaj dan</p>
            ) : (
              <div className="flex flex-col gap-2">
                {nutritionItems.map((item) => {
                  const confirmedLog = nutritionLogs.find((log) => log.nutritionPlanItem === item._id)
                  return (
                    <label key={item._id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={Boolean(confirmedLog)}
                        disabled={pendingItemId === item._id}
                        onCheckedChange={(checked) => handleToggleNutrition(item, checked === true)}
                      />
                      <span className={cn(confirmedLog && "text-muted-foreground line-through")}>
                        {item.foodName}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">{item.calories} kcal</span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium text-primary">
              <Dumbbell className="size-3.5" />
              Trening
            </h4>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Učitavanje...</p>
            ) : !user?.activeWorkoutPlan ? (
              <div className="flex flex-col items-start gap-2">
                <p className="text-sm text-muted-foreground">Nemaš aktivan plan treninga</p>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/workout-plans">Izaberi plan</Link>
                </Button>
              </div>
            ) : isToday ? (
              nextWorkoutDay?.day ? (
                <div className="flex flex-col items-start gap-1">
                  <p className="text-sm font-medium">{nextWorkoutDay.day.dayName}</p>
                  <p className="text-sm text-muted-foreground">
                    {nextWorkoutDay.day.exercises.length === 0
                      ? "Dan odmora"
                      : `${nextWorkoutDay.day.exercises.length} ${nextWorkoutDay.day.exercises.length === 1 ? "vežba" : "vežbi"}`}
                  </p>
                  <Button size="sm" asChild>
                    <Link to={`/workout-plans/${workoutPlan._id}/days/${nextWorkoutDay.day._id}`}>
                      Otvori dan
                    </Link>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nema dana u ovom planu</p>
              )
            ) : isFuture ? (
              <p className="text-sm text-muted-foreground">
                Trening plan ne prati kalendarske datume unapred — sledeći dan se određuje kad završiš prethodni.
              </p>
            ) : completedDay ? (
              <div className="flex flex-col items-start gap-1">
                <p className="text-sm font-medium">{completedDay.dayName}</p>
                <p className="text-sm text-muted-foreground">
                  {completedDay.exercises.length === 0
                    ? "Dan odmora"
                    : `Odrađeno — ${completedDay.exercises.length} ${completedDay.exercises.length === 1 ? "vežba" : "vežbi"}`}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nije bilo treninga ovog dana</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
