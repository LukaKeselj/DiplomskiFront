import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import toast from "react-hot-toast"
import { Pencil, Trash2 } from "lucide-react"

import { deleteWorkoutPlanRequest, getWorkoutPlanRequest } from "@/api/workoutPlans"
import { getExercisesRequest } from "@/api/exercises"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function WorkoutPlanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [exercises, setExercises] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const exerciseById = useMemo(() => {
    const map = new Map()
    exercises.forEach((exercise) => map.set(exercise._id, exercise))
    return map
  }, [exercises])

  async function handleDelete() {
    if (!window.confirm(`Obrisati plan "${plan.name}"?`)) return

    setIsDeleting(true)
    try {
      await deleteWorkoutPlanRequest(id)
      toast.success("Plan je obrisan")
      navigate("/workout-plans")
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("Nemaš dozvolu da obrišeš ovaj plan")
      } else {
        toast.error(error.response?.data?.message || "Brisanje plana nije uspelo")
      }
      setIsDeleting(false)
    }
  }

  return (
    <AppLayout breadcrumb={plan?.name ?? "Plan"}>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Učitavanje...</p>
      ) : plan ? (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl font-medium">{plan.name}</h1>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to={`/workout-plans/${plan._id}/edit`}>
                  <Pencil />
                  Izmeni
                </Link>
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                <Trash2 />
                {isDeleting ? "Brisanje..." : "Obriši"}
              </Button>
            </div>
          </div>

          {plan.days.map((day) => (
            <Card key={day._id}>
              <CardHeader>
                <CardTitle>{day.dayName}</CardTitle>
                <CardDescription>
                  {day.exercises.length} {day.exercises.length === 1 ? "vežba" : "vežbi"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {day.exercises.map((item) => {
                  const exercise = exerciseById.get(item.exercise)
                  return (
                    <div
                      key={item._id}
                      className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {exercise?.name ?? "Nepoznata vežba"}
                        </p>
                        {exercise?.muscleGroup && (
                          <p className="text-xs text-muted-foreground capitalize">
                            {exercise.muscleGroup}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.targetSets} x {item.targetReps}
                      </span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" onClick={() => navigate("/workout-plans")}>
            Nazad na listu
          </Button>
        </div>
      ) : null}
    </AppLayout>
  )
}
