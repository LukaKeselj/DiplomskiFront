import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import toast from "react-hot-toast"
import { ChevronRight, Pencil, Trash2 } from "lucide-react"

import {
  activateWorkoutPlanRequest,
  deleteWorkoutPlanRequest,
  getWorkoutPlanRequest,
} from "@/api/workoutPlans"
import { getNextWorkoutDayRequest } from "@/api/workoutSessions"
import { AppLayout } from "@/components/app-layout"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"

export default function WorkoutPlanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const [plan, setPlan] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isActivating, setIsActivating] = useState(false)
  const [nextDay, setNextDay] = useState(null)

  const isActivePlan = user?.activeWorkoutPlan === id

  useEffect(() => {
    getWorkoutPlanRequest(id)
      .then(setPlan)
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
  }, [id])

  async function handleActivate() {
    setIsActivating(true)
    try {
      const updatedUser = await activateWorkoutPlanRequest(id)
      updateUser(updatedUser)
      toast.success("Plan je aktiviran")
    } catch (error) {
      toast.error(error.response?.data?.message || "Aktivacija nije uspela")
    } finally {
      setIsActivating(false)
    }
  }

  async function handleDelete() {
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
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-medium">{plan.name}</h1>
              {isActivePlan && (
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Aktivan
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {!isActivePlan && (
                <Button onClick={handleActivate} disabled={isActivating}>
                  {isActivating ? "Aktiviranje..." : "Aktiviraj"}
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link to={`/workout-plans/${plan._id}/edit`}>
                  <Pencil />
                  Izmeni
                </Link>
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isDeleting}
              >
                <Trash2 />
                {isDeleting ? "Brisanje..." : "Obriši"}
              </Button>
            </div>
          </div>

          {plan.days.map((day) => (
            <Link key={day._id} to={`/workout-plans/${plan._id}/days/${day._id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>{day.dayName}</CardTitle>
                    {nextDay?.day?._id === day._id && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Sledeći
                      </span>
                    )}
                  </div>
                  <CardDescription>
                    {day.exercises.length} {day.exercises.length === 1 ? "vežba" : "vežbi"}
                  </CardDescription>
                  <CardAction>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </CardAction>
                </CardHeader>
              </Card>
            </Link>
          ))}

          <Button variant="outline" onClick={() => navigate("/workout-plans")}>
            Nazad na listu
          </Button>
        </div>
      ) : null}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Da li si siguran da želiš da obrišeš plan &quot;{plan?.name}&quot;? Ova akcija se ne
              može poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Otkaži</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
