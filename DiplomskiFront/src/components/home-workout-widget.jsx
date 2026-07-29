import { useEffect, useState } from "react"
import { Link } from "react-router"
import { Dumbbell } from "lucide-react"

import { getActiveWorkoutPlanRequest } from "@/api/workoutPlans"
import { getNextWorkoutDayRequest } from "@/api/workoutSessions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"

export function HomeWorkoutWidget() {
  const { user } = useAuth()
  const [plan, setPlan] = useState(null)
  const [nextDay, setNextDay] = useState(null)
  const [isLoading, setIsLoading] = useState(Boolean(user?.activeWorkoutPlan))

  useEffect(() => {
    if (!user?.activeWorkoutPlan) return

    Promise.all([getActiveWorkoutPlanRequest(), getNextWorkoutDayRequest(user.activeWorkoutPlan)])
      .then(([planData, nextDayData]) => {
        setPlan(planData)
        setNextDay(nextDayData)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [user?.activeWorkoutPlan])

  const isRestDay = nextDay?.day && nextDay.day.exercises.length === 0

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Dumbbell className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="font-heading text-sm font-medium">Trening danas</p>
            <p className="truncate text-xs text-muted-foreground">
              {plan?.name ?? "Nema aktivnog plana"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-end gap-4">
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
            <div>
              <p className="text-2xl font-semibold">{nextDay.day.dayName}</p>
              <p className="text-sm text-muted-foreground">
                {isRestDay
                  ? "Dan odmora"
                  : `${nextDay.day.exercises.length} ${nextDay.day.exercises.length === 1 ? "vežba" : "vežbi"}`}
              </p>
            </div>
            <Button asChild className="w-full">
              <Link to={`/workout-plans/${plan._id}/days/${nextDay.day._id}`}>Otvori dan</Link>
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Nema dana u ovom planu</p>
        )}
      </CardContent>
    </Card>
  )
}
