import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import toast from "react-hot-toast"
import { ArrowLeft, Check } from "lucide-react"

import { getWorkoutPlanRequest } from "@/api/workoutPlans"
import { getExercisesRequest } from "@/api/exercises"
import { completeWorkoutDayRequest, getNextWorkoutDayRequest } from "@/api/workoutSessions"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { DayExerciseCard } from "@/components/day-exercise-card"

function todayDateString() {
  return new Date().toISOString().slice(0, 10)
}

export default function WorkoutPlanDayDetail() {
  const { id, dayId } = useParams()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [exercises, setExercises] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [nextDay, setNextDay] = useState(null)
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
          toast.error("Nemaš pristup ovom planu")
        } else {
          toast.error(error.response?.data?.message || "Plan nije pronađen")
        }
        navigate("/workout-plans")
      })
      .finally(() => setIsLoading(false))
  }, [id, navigate])

  useEffect(() => {
    getNextWorkoutDayRequest(id)
      .then(setNextDay)
      .catch(() => {})
  }, [id, justCompleted])

  const exerciseById = useMemo(() => {
    const map = new Map()
    exercises.forEach((exercise) => map.set(exercise._id, exercise))
    return map
  }, [exercises])

  const day = plan?.days.find((d) => d._id === dayId)

  useEffect(() => {
    if (!isLoading && plan && !day) {
      toast.error("Dan nije pronađen")
      navigate(`/workout-plans/${id}`)
    }
  }, [isLoading, plan, day, id, navigate])

  const isNextDay = nextDay?.day?._id === dayId

  async function handleCompleteDay() {
    setIsCompleting(true)
    try {
      await completeWorkoutDayRequest({ workoutPlan: id, day: dayId, date: todayDateString() })
      toast.success("Dan je označen kao odrađen")
      setJustCompleted(true)
    } catch (error) {
      toast.error(error.response?.data?.message || "Nije uspelo označavanje dana")
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <AppLayout breadcrumb={day?.dayName ?? "Dan"}>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Učitavanje...</p>
      ) : day ? (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <div>
            <Button variant="outline" asChild>
              <Link to={`/workout-plans/${id}`}>
                <ArrowLeft />
                Nazad na plan
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-medium">{day.dayName}</h1>
              <p className="text-sm text-muted-foreground">
                {day.exercises.length} {day.exercises.length === 1 ? "vežba" : "vežbi"}
              </p>
            </div>
            {justCompleted ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <Check className="size-4" />
                Odrađeno danas
              </span>
            ) : isNextDay ? (
              <Button onClick={handleCompleteDay} disabled={isCompleting}>
                <Check />
                {isCompleting ? "Čuvanje..." : "Završi dan"}
              </Button>
            ) : nextDay?.day ? (
              <span className="text-sm text-muted-foreground">
                Sledeći na redu:{" "}
                <Link className="underline underline-offset-4" to={`/workout-plans/${id}/days/${nextDay.day._id}`}>
                  {nextDay.day.dayName}
                </Link>
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            {day.exercises.map((item, index) => (
              <DayExerciseCard
                key={item._id}
                order={index + 1}
                item={item}
                exercise={exerciseById.get(item.exercise)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </AppLayout>
  )
}
