import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
import { ArrowLeft, Check } from "lucide-react"

import { getWorkoutPlanRequest } from "@/api/workoutPlans"
import { getExercisesRequest } from "@/api/exercises"
import { completeWorkoutDayRequest } from "@/api/workoutSessions"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { CardGrid, CardGridItem } from "@/components/ui/card-grid"
import { Skeleton } from "@/components/ui/skeleton"
import { DayExerciseCard } from "@/components/day-exercise-card"
import { useAuth } from "@/context/AuthContext"
import { getWorkoutScheduleForDate } from "@/lib/workout-cycle"

function todayDateString() {
  return new Date().toISOString().slice(0, 10)
}

export default function WorkoutPlanDayDetail() {
  const { t } = useTranslation()
  const { id, dayId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [plan, setPlan] = useState(null)
  const [exercises, setExercises] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCompleting, setIsCompleting] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)

  useEffect(() => {
    Promise.all([getWorkoutPlanRequest(id), getExercisesRequest()])
      .then(([planData, exercisesData]) => {
        setPlan(planData)
        setExercises(exercisesData)
      })
      .catch((error) => {
        if (error.response?.status === 403) {
          toast.error(t("workout.dayDetail.toasts.accessDenied"))
        } else {
          toast.error(error.response?.data?.message || t("workout.dayDetail.toasts.notFound"))
        }
        navigate("/workout-plans")
      })
      .finally(() => setIsLoading(false))
  }, [id, navigate, t])

  const isActivePlan = user?.activeWorkoutPlan === id

  const nextDay = useMemo(() => {
    if (!isActivePlan || !plan) return null
    return getWorkoutScheduleForDate(plan, user?.activeWorkoutPlanStartDate, new Date())
  }, [isActivePlan, plan, user?.activeWorkoutPlanStartDate])

  const exerciseById = useMemo(() => {
    const map = new Map()
    exercises.forEach((exercise) => map.set(exercise._id, exercise))
    return map
  }, [exercises])

  const day = plan?.days.find((d) => d._id === dayId)

  useEffect(() => {
    if (!isLoading && plan && !day) {
      toast.error(t("workout.dayDetail.toasts.dayNotFound"))
      navigate(`/workout-plans/${id}`)
    }
  }, [isLoading, plan, day, id, navigate, t])

  const isNextDay = nextDay?.day?._id === dayId

  async function handleCompleteDay() {
    setIsCompleting(true)
    try {
      await completeWorkoutDayRequest({ workoutPlan: id, day: dayId, date: todayDateString() })
      toast.success(t("workout.dayDetail.toasts.completeSuccess"))
      setJustCompleted(true)
    } catch (error) {
      toast.error(error.response?.data?.message || t("workout.dayDetail.toasts.completeFailed"))
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <AppLayout breadcrumb={day?.dayName ?? t("workout.dayDetail.breadcrumbFallback")}>
      {isLoading ? (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <Skeleton className="h-9 w-32" />
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : day ? (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <div>
            <Button variant="outline" asChild>
              <Link to={`/workout-plans/${id}`}>
                <ArrowLeft />
                {t("workout.dayDetail.backToPlan")}
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-medium">{day.dayName}</h1>
              <p className="text-sm text-muted-foreground">
                {day.exercises.length}{" "}
                {t(
                  day.exercises.length === 1
                    ? "workout.dayDetail.exerciseCount.one"
                    : "workout.dayDetail.exerciseCount.other"
                )}
              </p>
            </div>
            {justCompleted ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <Check className="size-4" />
                {t("workout.dayDetail.completedToday")}
              </span>
            ) : isNextDay ? (
              <Button onClick={handleCompleteDay} disabled={isCompleting}>
                <Check />
                {isCompleting ? t("workout.dayDetail.saving") : t("workout.dayDetail.finishDay")}
              </Button>
            ) : nextDay?.day ? (
              <span className="text-sm text-muted-foreground">
                {t("workout.dayDetail.nextUpLabel")}{" "}
                <Link className="underline underline-offset-4" to={`/workout-plans/${id}/days/${nextDay.day._id}`}>
                  {nextDay.day.dayName}
                </Link>
              </span>
            ) : null}
          </div>

          <CardGrid className="flex flex-col gap-3">
            {day.exercises.map((item, index) => (
              <CardGridItem key={item._id}>
                <DayExerciseCard
                  order={index + 1}
                  item={item}
                  exercise={exerciseById.get(item.exercise)}
                />
              </CardGridItem>
            ))}
          </CardGrid>
        </div>
      ) : null}
    </AppLayout>
  )
}
