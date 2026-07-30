import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router"
import toast from "react-hot-toast"
import { Check, ChevronLeft, ChevronRight, Dumbbell } from "lucide-react"

import { getExercisesRequest } from "@/api/exercises"
import { getActiveWorkoutPlanRequest } from "@/api/workoutPlans"
import {
  completeWorkoutDayRequest,
  getNextWorkoutDayRequest,
  getWorkoutSessionsRequest,
} from "@/api/workoutSessions"
import { getWorkoutLogsRequest } from "@/api/workoutLogs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DayExerciseCard } from "@/components/day-exercise-card"
import { useAuth } from "@/context/AuthContext"
import { formatFullDateLabel } from "@/lib/utils"

function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function daysBetweenKeys(fromKey, toKey) {
  const [fy, fm, fd] = fromKey.split("-").map(Number)
  const [ty, tm, td] = toKey.split("-").map(Number)
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000)
}

export function HomeWorkoutWidget({ date }) {
  const { user } = useAuth()
  const selectedDate = useMemo(() => date ?? new Date(), [date])
  const dateKey = useMemo(() => toDateKey(selectedDate), [selectedDate])
  const todayKey = useMemo(() => toDateKey(new Date()), [])
  const isToday = dateKey === todayKey
  const isPast = dateKey < todayKey
  const isFuture = dateKey > todayKey

  const [plan, setPlan] = useState(null)
  const [nextDay, setNextDay] = useState(null)
  const [sessions, setSessions] = useState([])
  const [exercises, setExercises] = useState([])
  const [workoutLogs, setWorkoutLogs] = useState([])
  const [isLoading, setIsLoading] = useState(Boolean(user?.activeWorkoutPlan))
  const [isCompleting, setIsCompleting] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)
  const scrollRef = useRef(null)

  function scrollByAmount(amount) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" })
  }

  useEffect(() => {
    if (!user?.activeWorkoutPlan) return

    Promise.all([
      getActiveWorkoutPlanRequest(),
      getNextWorkoutDayRequest(user.activeWorkoutPlan),
      getWorkoutSessionsRequest(user.activeWorkoutPlan),
      getExercisesRequest(),
    ])
      .then(([planData, nextDayData, sessionsData, exercisesData]) => {
        setPlan(planData)
        setNextDay(nextDayData)
        setSessions(sessionsData)
        setExercises(exercisesData)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [user?.activeWorkoutPlan])

  useEffect(() => {
    if (!user?.activeWorkoutPlan) return
    getWorkoutLogsRequest({ date: dateKey })
      .then(setWorkoutLogs)
      .catch(() => {})
  }, [user?.activeWorkoutPlan, dateKey])

  const weightByExercise = useMemo(() => {
    const map = new Map()
    workoutLogs.forEach((log) => map.set(log.exercise, log.weight))
    return map
  }, [workoutLogs])

  const exerciseById = useMemo(() => {
    const map = new Map()
    exercises.forEach((exercise) => map.set(exercise._id, exercise))
    return map
  }, [exercises])

  const sessionForDate = useMemo(
    () => sessions.find((session) => session.date.slice(0, 10) === dateKey),
    [sessions, dateKey]
  )

  const completedDay = useMemo(() => {
    if (!sessionForDate || !plan) return null
    return plan.days.find((day) => day._id === sessionForDate.day) ?? null
  }, [sessionForDate, plan])

  const nextDayIndex = useMemo(() => {
    if (!plan || !nextDay?.day) return -1
    return plan.days.findIndex((day) => day._id === nextDay.day._id)
  }, [plan, nextDay])

  // Preview-only projection: assumes the plan's days repeat in order starting
  // from the next un-completed day, one per day. Not authoritative — the real
  // next day is only decided once the previous one is actually completed.
  const previewDay = useMemo(() => {
    if (!plan || !isFuture || nextDayIndex === -1 || plan.days.length === 0) return null
    const diff = daysBetweenKeys(todayKey, dateKey)
    const index = (nextDayIndex + diff) % plan.days.length
    return plan.days[index]
  }, [plan, isFuture, nextDayIndex, todayKey, dateKey])

  const dayToShow = isToday ? nextDay?.day : isPast ? completedDay : previewDay
  const isRestDay = Boolean(dayToShow && dayToShow.exercises.length === 0)

  async function handleCompleteDay() {
    if (!user?.activeWorkoutPlan || !nextDay?.day) return

    setIsCompleting(true)
    try {
      await completeWorkoutDayRequest({
        workoutPlan: user.activeWorkoutPlan,
        day: nextDay.day._id,
        date: dateKey,
      })
      toast.success("Dan je označen kao odrađen")
      setJustCompleted(true)
    } catch (error) {
      toast.error(error.response?.data?.message || "Nije uspelo označavanje dana")
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Dumbbell className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-medium">
              {isToday ? "Trening danas" : `Trening — ${formatFullDateLabel(selectedDate)}`}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {plan?.name ?? "Nema aktivnog plana"}
            </p>
          </div>
          {isToday && justCompleted && (
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="size-3.5" />
              Odrađeno
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Učitavanje...</p>
        ) : !plan ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-8 text-center">
            <p className="text-sm text-muted-foreground">Nemaš aktivan plan treninga</p>
            <Button size="sm" variant="outline" asChild>
              <Link to="/workout-plans">Izaberi plan</Link>
            </Button>
          </div>
        ) : !isToday && !dayToShow ? (
          isPast ? (
            <p className="text-sm text-muted-foreground">Nije bilo treninga ovog dana</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aktiviraj plan i odradi bar jedan trening da bi video pregled narednih dana.
            </p>
          )
        ) : dayToShow ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <p className="text-lg font-semibold">
                {dayToShow.dayName}
                {isPast && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    — odrađeno
                  </span>
                )}
                {isFuture && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    — pregled
                  </span>
                )}
              </p>
              <div className="flex items-center gap-2">
                {isToday && !justCompleted && !isRestDay && (
                  <Button size="sm" onClick={handleCompleteDay} disabled={isCompleting}>
                    <Check />
                    {isCompleting ? "Čuvanje..." : "Završi dan"}
                  </Button>
                )}
                {!isRestDay && dayToShow.exercises.length > 1 && (
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => scrollByAmount(-336)}
                    >
                      <ChevronLeft />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => scrollByAmount(336)}
                    >
                      <ChevronRight />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            {isRestDay ? (
              <p className="text-sm text-muted-foreground">Dan odmora</p>
            ) : (
              <div
                ref={scrollRef}
                className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {dayToShow.exercises.map((item, index) => (
                  <div key={item._id} className="w-80 shrink-0 snap-start sm:w-96">
                    <DayExerciseCard
                      order={index + 1}
                      item={item}
                      exercise={exerciseById.get(item.exercise)}
                      date={dateKey}
                      readOnly={isFuture}
                      loggedWeight={weightByExercise.get(item.exercise) ?? null}
                      onWeightSaved={(weight) =>
                        setWorkoutLogs((prev) => [
                          ...prev.filter((log) => log.exercise !== item.exercise),
                          { exercise: item.exercise, weight, date: dateKey },
                        ])
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Nema dana u ovom planu</p>
        )}
      </CardContent>
    </Card>
  )
}
