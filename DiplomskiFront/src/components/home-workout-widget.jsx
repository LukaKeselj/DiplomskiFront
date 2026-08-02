import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
import { Check, ChevronLeft, ChevronRight, Dumbbell } from "lucide-react"

import { getExercisesRequest } from "@/api/exercises"
import { getActiveWorkoutPlanRequest } from "@/api/workoutPlans"
import {
  completeWorkoutDayRequest,
  getWorkoutSessionsRequest,
  skipWorkoutDayRequest,
} from "@/api/workoutSessions"
import { getWorkoutLogsRequest } from "@/api/workoutLogs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CardGrid, CardGridItem } from "@/components/ui/card-grid"
import { Skeleton } from "@/components/ui/skeleton"
import { DayExerciseCard } from "@/components/day-exercise-card"
import { useAuth } from "@/context/AuthContext"
import { formatFullDateLabel } from "@/lib/utils"
import { getWorkoutScheduleForDate, isBeforeActivation } from "@/lib/workout-cycle"

function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function HomeWorkoutWidget({ date, onSessionChange }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const selectedDate = useMemo(() => date ?? new Date(), [date])
  const dateKey = useMemo(() => toDateKey(selectedDate), [selectedDate])
  const todayKey = useMemo(() => toDateKey(new Date()), [])
  const isToday = dateKey === todayKey
  const isPast = dateKey < todayKey
  const isFuture = dateKey > todayKey

  const [plan, setPlan] = useState(null)
  const [sessions, setSessions] = useState([])
  const [exercises, setExercises] = useState([])
  const [workoutLogs, setWorkoutLogs] = useState([])
  const [isLoading, setIsLoading] = useState(Boolean(user?.activeWorkoutPlan))
  const [isCompleting, setIsCompleting] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)
  const [justSkipped, setJustSkipped] = useState(false)
  const scrollRef = useRef(null)

  function scrollByAmount(amount) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" })
  }

  useEffect(() => {
    if (!user?.activeWorkoutPlan) return

    Promise.all([
      getActiveWorkoutPlanRequest(),
      getWorkoutSessionsRequest(user.activeWorkoutPlan),
      getExercisesRequest(),
    ])
      .then(([planData, sessionsData, exercisesData]) => {
        setPlan(planData)
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

  const scheduledForDate = useMemo(
    () => getWorkoutScheduleForDate(plan, user?.activeWorkoutPlanStartDate, selectedDate),
    [plan, user?.activeWorkoutPlanStartDate, selectedDate]
  )

  const beforeActivation = useMemo(
    () => isBeforeActivation(user?.activeWorkoutPlanStartDate, selectedDate),
    [user?.activeWorkoutPlanStartDate, selectedDate]
  )

  const dayToShow = scheduledForDate.day
  const isRestDay = scheduledForDate.isRestDay === true
  const isEmptyPlan = scheduledForDate.isRestDay === null

  const isCompletedForDate = sessionForDate?.status === "completed" || (isToday && justCompleted)
  const isSkippedForDate = sessionForDate?.status === "skipped" || (isToday && justSkipped)
  const missedPast = isPast && dayToShow && !sessionForDate
  const showExercises = dayToShow && !isSkippedForDate && !missedPast

  async function handleCompleteDay() {
    if (!user?.activeWorkoutPlan || !dayToShow) return

    setIsCompleting(true)
    try {
      await completeWorkoutDayRequest({
        workoutPlan: user.activeWorkoutPlan,
        day: dayToShow._id,
        date: dateKey,
      })
      toast.success(t("home.workoutWidget.toasts.completeSuccess"))
      setJustCompleted(true)
      onSessionChange?.()
    } catch (error) {
      toast.error(error.response?.data?.message || t("home.workoutWidget.toasts.completeError"))
    } finally {
      setIsCompleting(false)
    }
  }

  async function handleSkipDay() {
    if (!user?.activeWorkoutPlan || !dayToShow) return

    setIsSkipping(true)
    try {
      await skipWorkoutDayRequest({
        workoutPlan: user.activeWorkoutPlan,
        day: dayToShow._id,
        date: dateKey,
      })
      toast.success(t("home.workoutWidget.toasts.skipSuccess"))
      setJustSkipped(true)
      onSessionChange?.()
    } catch (error) {
      toast.error(error.response?.data?.message || t("home.workoutWidget.toasts.skipError"))
    } finally {
      setIsSkipping(false)
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
              {isToday
                ? t("home.workoutWidget.titleToday")
                : t("home.workoutWidget.titleForDate", { date: formatFullDateLabel(selectedDate) })}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {plan?.name ?? t("home.workoutWidget.noPlanLabel")}
            </p>
          </div>
          {isToday && isCompletedForDate && (
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="size-3.5" />
              {t("home.workoutWidget.completedBadge")}
            </span>
          )}
          {isToday && isSkippedForDate && (
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
              {t("home.workoutWidget.skippedBadge")}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        {isLoading ? (
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-80 shrink-0 sm:w-96" />
            ))}
          </div>
        ) : !plan ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-8 text-center">
            <p className="text-sm text-muted-foreground">{t("home.workoutWidget.noPlan")}</p>
            <Button size="sm" variant="outline" asChild>
              <Link to="/workout-plans">{t("home.workoutWidget.choosePlan")}</Link>
            </Button>
          </div>
        ) : beforeActivation ? (
          <p className="text-sm text-muted-foreground">{t("home.workoutWidget.beforeActivation")}</p>
        ) : isEmptyPlan ? (
          <p className="text-sm text-muted-foreground">{t("home.workoutWidget.emptyPlan")}</p>
        ) : isRestDay ? (
          <>
            <p className="text-lg font-semibold">{t("home.workoutWidget.restDay.title")}</p>
            <p className="text-sm text-muted-foreground">{t("home.workoutWidget.restDay.subtitle")}</p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <p className="text-lg font-semibold">
                {dayToShow.dayName}
                {isPast && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {isSkippedForDate
                      ? t("home.workoutWidget.pastStatus.skipped")
                      : isCompletedForDate
                        ? t("home.workoutWidget.pastStatus.completed")
                        : t("home.workoutWidget.pastStatus.notCompleted")}
                  </span>
                )}
                {isFuture && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {t("home.workoutWidget.futureStatus")}
                  </span>
                )}
              </p>
              <div className="flex items-center gap-2">
                {isToday && !isCompletedForDate && !isSkippedForDate && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSkipDay}
                      disabled={isCompleting || isSkipping}
                    >
                      {isSkipping ? t("home.workoutWidget.saving") : t("home.workoutWidget.skipDay")}
                    </Button>
                    <Button size="sm" onClick={handleCompleteDay} disabled={isCompleting || isSkipping}>
                      <Check />
                      {isCompleting ? t("home.workoutWidget.saving") : t("home.workoutWidget.completeDay")}
                    </Button>
                  </>
                )}
                {showExercises && dayToShow.exercises.length > 1 && (
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
            {isSkippedForDate ? (
              <p className="text-sm text-muted-foreground">{t("home.workoutWidget.skippedDay")}</p>
            ) : missedPast ? (
              <p className="text-sm text-muted-foreground">{t("home.workoutWidget.missedDay")}</p>
            ) : (
              <CardGrid
                ref={scrollRef}
                className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pt-2 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {dayToShow.exercises.map((item, index) => (
                  <CardGridItem key={item._id} className="w-80 shrink-0 snap-start sm:w-96">
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
                  </CardGridItem>
                ))}
              </CardGrid>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
