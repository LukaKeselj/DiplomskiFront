import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import toast from "react-hot-toast"
import { Apple, CalendarDays, ChevronDown, Dumbbell } from "lucide-react"
import { srLatn } from "date-fns/locale"

import { getExercisesRequest } from "@/api/exercises"
import { deleteNutritionLogRequest, getNutritionLogsRequest } from "@/api/nutrition"
import { confirmNutritionPlanItemRequest, getActiveNutritionPlanRequest } from "@/api/nutritionPlans"
import { getActiveWorkoutPlanRequest } from "@/api/workoutPlans"
import { getNextWorkoutDayRequest, getWorkoutSessionsRequest } from "@/api/workoutSessions"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useAuth } from "@/context/AuthContext"
import { cn, formatFullDateLabel } from "@/lib/utils"
import { getNutritionPlanDayForDate, isBeforeActivation } from "@/lib/nutrition-cycle"

function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function HomeCalendar() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [nutritionPlan, setNutritionPlan] = useState(null)
  const [nutritionLogs, setNutritionLogs] = useState([])
  const [workoutPlan, setWorkoutPlan] = useState(null)
  const [workoutSessions, setWorkoutSessions] = useState([])
  const [nextWorkoutDay, setNextWorkoutDay] = useState(null)
  const [exercises, setExercises] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pendingItemId, setPendingItemId] = useState(null)

  const dateKey = useMemo(() => toDateKey(selectedDate), [selectedDate])
  const todayKey = useMemo(() => toDateKey(new Date()), [])
  const isToday = dateKey === todayKey
  const isFuture = dateKey > todayKey

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false

    Promise.all([
      user?.activeNutritionPlan ? getActiveNutritionPlanRequest() : Promise.resolve(null),
      getNutritionLogsRequest(dateKey),
      user?.activeWorkoutPlan ? getActiveWorkoutPlanRequest() : Promise.resolve(null),
      user?.activeWorkoutPlan ? getWorkoutSessionsRequest(user.activeWorkoutPlan) : Promise.resolve([]),
      user?.activeWorkoutPlan ? getExercisesRequest() : Promise.resolve([]),
    ])
      .then(([planData, logsData, workoutPlanData, sessionsData, exercisesData]) => {
        if (cancelled) return
        setNutritionPlan(planData)
        setNutritionLogs(logsData)
        setWorkoutPlan(workoutPlanData)
        setWorkoutSessions(sessionsData)
        setExercises(exercisesData)
      })
      .catch(() => {})
      .finally(() => !cancelled && setIsLoading(false))

    return () => {
      cancelled = true
    }
  }, [isOpen, dateKey, user?.activeNutritionPlan, user?.activeWorkoutPlan])

  useEffect(() => {
    if (!isOpen || !isToday || !user?.activeWorkoutPlan) return
    getNextWorkoutDayRequest(user.activeWorkoutPlan)
      .then(setNextWorkoutDay)
      .catch(() => {})
  }, [isOpen, isToday, user?.activeWorkoutPlan])

  const nutritionItems = useMemo(() => {
    if (!nutritionPlan || isBeforeActivation(user?.activeNutritionPlanStartDate, selectedDate)) {
      return []
    }
    return getNutritionPlanDayForDate(nutritionPlan, user?.activeNutritionPlanStartDate, selectedDate)
      ?.items ?? []
  }, [nutritionPlan, user?.activeNutritionPlanStartDate, selectedDate])

  const sessionForDate = useMemo(
    () => workoutSessions.find((session) => session.date.slice(0, 10) === dateKey),
    [workoutSessions, dateKey]
  )

  const completedDay = useMemo(() => {
    if (!sessionForDate || !workoutPlan) return null
    return workoutPlan.days.find((day) => day._id === sessionForDate.day) ?? null
  }, [sessionForDate, workoutPlan])

  const exerciseById = useMemo(() => {
    const map = new Map()
    exercises.forEach((exercise) => map.set(exercise._id, exercise))
    return map
  }, [exercises])

  const workoutDayToShow = isToday ? nextWorkoutDay?.day : completedDay

  function renderWorkoutExercises(day) {
    if (day.exercises.length === 0) {
      return <p className="text-sm text-muted-foreground">Dan odmora</p>
    }

    return (
      <div className="flex flex-col gap-1">
        {day.exercises.map((item) => {
          const exercise = exerciseById.get(item.exercise)
          return (
            <div key={item._id} className="flex items-center justify-between text-sm">
              <span>{exercise?.name ?? "Nepoznata vežba"}</span>
              <span className="text-xs text-muted-foreground">
                {item.targetSets} x {item.targetReps}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

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
    <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
      <Card className="group/calendar">
        <CardHeader>
          <CollapsibleTrigger asChild>
            <button type="button" className="flex w-full items-center gap-2 text-left">
              <CalendarDays className="size-4 text-muted-foreground" />
              <div className="flex-1">
                <span className="font-heading text-sm font-medium">Kalendar</span>
                <span className="block text-xs text-muted-foreground">
                  {formatFullDateLabel(selectedDate)}
                </span>
              </div>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/calendar:rotate-180" />
            </button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="flex flex-col gap-4 md:flex-row">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={srLatn}
              className="rounded-md border p-2"
            />
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">{formatFullDateLabel(selectedDate)}</h3>
                {!isToday && (
                  <Button size="sm" variant="ghost" onClick={() => setSelectedDate(new Date())}>
                    Danas
                  </Button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border p-3">
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
                    <p className="text-sm text-muted-foreground">
                      Nema planiranih namirnica za ovaj dan
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {nutritionItems.map((item) => {
                        const confirmedLog = nutritionLogs.find(
                          (log) => log.nutritionPlanItem === item._id
                        )
                        return (
                          <label key={item._id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={Boolean(confirmedLog)}
                              disabled={pendingItemId === item._id}
                              onCheckedChange={(checked) =>
                                handleToggleNutrition(item, checked === true)
                              }
                            />
                            <span
                              className={cn(confirmedLog && "text-muted-foreground line-through")}
                            >
                              {item.foodName}
                            </span>
                            <span className="ml-auto text-xs text-muted-foreground">
                              {item.calories} kcal
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-border p-3">
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
                    workoutDayToShow ? (
                      <div className="flex flex-col items-start gap-2">
                        <p className="text-sm font-medium">{workoutDayToShow.dayName}</p>
                        {renderWorkoutExercises(workoutDayToShow)}
                        <Button size="sm" asChild>
                          <Link to={`/workout-plans/${workoutPlan._id}/days/${workoutDayToShow._id}`}>
                            Otvori dan
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nema dana u ovom planu</p>
                    )
                  ) : isFuture ? (
                    <p className="text-sm text-muted-foreground">
                      Trening plan ne prati kalendarske datume unapred — sledeći dan se određuje
                      kad završiš prethodni.
                    </p>
                  ) : completedDay ? (
                    <div className="flex flex-col items-start gap-2">
                      <p className="text-sm font-medium">
                        {completedDay.dayName}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          — odrađeno
                        </span>
                      </p>
                      {renderWorkoutExercises(completedDay)}
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/workout-plans/${workoutPlan._id}/days/${completedDay._id}`}>
                          Otvori dan
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nije bilo treninga ovog dana</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
