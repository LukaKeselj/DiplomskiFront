import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import toast from "react-hot-toast"
import { Minus, TrendingDown, TrendingUp } from "lucide-react"

import { getExercisesRequest } from "@/api/exercises"
import { getWorkoutLogsRequest } from "@/api/workoutLogs"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function DeltaBadge({ delta }) {
  if (delta > 0) {
    return (
      <span className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
        <TrendingUp className="size-4" />+{delta} kg
      </span>
    )
  }
  if (delta < 0) {
    return (
      <span className="flex items-center gap-1 text-sm font-medium text-rose-600 dark:text-rose-400">
        <TrendingDown className="size-4" />
        {delta} kg
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
      <Minus className="size-4" />0 kg
    </span>
  )
}

export default function ExerciseProgressOverview() {
  const [exercises, setExercises] = useState([])
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([getExercisesRequest(), getWorkoutLogsRequest()])
      .then(([exercisesData, logsData]) => {
        setExercises(exercisesData)
        setLogs(logsData)
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Neuspešno učitavanje napretka")
      })
      .finally(() => setIsLoading(false))
  }, [])

  const exerciseById = useMemo(() => {
    const map = new Map()
    exercises.forEach((exercise) => map.set(exercise._id, exercise))
    return map
  }, [exercises])

  const progressByExercise = useMemo(() => {
    const grouped = new Map()
    logs.forEach((log) => {
      const list = grouped.get(log.exercise) ?? []
      list.push(log)
      grouped.set(log.exercise, list)
    })

    return Array.from(grouped.entries())
      .map(([exerciseId, entries]) => {
        const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date))
        const first = sorted[0]
        const last = sorted[sorted.length - 1]
        const max = sorted.reduce((m, entry) => Math.max(m, entry.weight), -Infinity)

        return {
          exerciseId,
          exercise: exerciseById.get(exerciseId),
          entryCount: sorted.length,
          first,
          last,
          max,
          delta: Math.round((last.weight - first.weight) * 10) / 10,
        }
      })
      .filter((item) => item.exercise)
      .sort((a, b) => new Date(b.last.date) - new Date(a.last.date))
  }, [logs, exerciseById])

  return (
    <AppLayout breadcrumb="Napredak po vežbama">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Učitavanje...</p>
      ) : progressByExercise.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Još nema zabeleženih kilaža. Unesi kilažu na nekoj vežbi (na Home stranici ili u
          detaljima vežbe) da bi pratio/la napredak ovde.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {progressByExercise.map((item) => (
            <Link key={item.exerciseId} to={`/exercises/${item.exerciseId}`}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">{item.exercise.name}</CardTitle>
                  <CardDescription className="capitalize">
                    {item.exercise.muscleGroup}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-semibold">{item.last.weight} kg</span>
                    <DeltaBadge delta={item.delta} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Prvi unos: {item.first.weight} kg</span>
                    <span>Max: {item.max} kg</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.entryCount} {item.entryCount === 1 ? "unos" : "unosa"}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
