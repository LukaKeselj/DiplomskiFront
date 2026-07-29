import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router"
import toast from "react-hot-toast"
import { Check, ChevronLeft, ChevronRight, Dumbbell } from "lucide-react"

import { getExercisesRequest } from "@/api/exercises"
import { getActiveWorkoutPlanRequest } from "@/api/workoutPlans"
import { completeWorkoutDayRequest, getNextWorkoutDayRequest } from "@/api/workoutSessions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DayExerciseCard } from "@/components/day-exercise-card"
import { useAuth } from "@/context/AuthContext"

function todayDateString() {
  return new Date().toISOString().slice(0, 10)
}

export function HomeWorkoutWidget() {
  const { user } = useAuth()
  const [plan, setPlan] = useState(null)
  const [nextDay, setNextDay] = useState(null)
  const [exercises, setExercises] = useState([])
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
      getExercisesRequest(),
    ])
      .then(([planData, nextDayData, exercisesData]) => {
        setPlan(planData)
        setNextDay(nextDayData)
        setExercises(exercisesData)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [user?.activeWorkoutPlan])

  const exerciseById = useMemo(() => {
    const map = new Map()
    exercises.forEach((exercise) => map.set(exercise._id, exercise))
    return map
  }, [exercises])

  const isRestDay = nextDay?.day && nextDay.day.exercises.length === 0

  async function handleCompleteDay() {
    if (!user?.activeWorkoutPlan || !nextDay?.day) return

    setIsCompleting(true)
    try {
      await completeWorkoutDayRequest({
        workoutPlan: user.activeWorkoutPlan,
        day: nextDay.day._id,
        date: todayDateString(),
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
            <p className="font-heading text-sm font-medium">Trening danas</p>
            <p className="truncate text-xs text-muted-foreground">
              {plan?.name ?? "Nema aktivnog plana"}
            </p>
          </div>
          {justCompleted && (
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
        ) : nextDay?.day ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <p className="text-lg font-semibold">{nextDay.day.dayName}</p>
              <div className="flex items-center gap-2">
                {!justCompleted && !isRestDay && (
                  <Button size="sm" onClick={handleCompleteDay} disabled={isCompleting}>
                    <Check />
                    {isCompleting ? "Čuvanje..." : "Završi dan"}
                  </Button>
                )}
                {!isRestDay && nextDay.day.exercises.length > 1 && (
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
                {nextDay.day.exercises.map((item, index) => (
                  <div key={item._id} className="w-80 shrink-0 snap-start sm:w-96">
                    <DayExerciseCard
                      order={index + 1}
                      item={item}
                      exercise={exerciseById.get(item.exercise)}
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
