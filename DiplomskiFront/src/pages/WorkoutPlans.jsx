import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import toast from "react-hot-toast"
import { Dumbbell, Pencil, Plus, Search, Trash2 } from "lucide-react"

import { deleteWorkoutPlanRequest, getWorkoutPlansRequest } from "@/api/workoutPlans"
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
import { CardGrid, CardGridItem } from "@/components/ui/card-grid"
import { CardGridSkeleton } from "@/components/ui/card-grid-skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"

function PlanCard({ plan, isActive, onDeleteRequest }) {
  const navigate = useNavigate()

  function handleEditClick(event) {
    event.preventDefault()
    event.stopPropagation()
    navigate(`/workout-plans/${plan._id}/edit`)
  }

  function handleDeleteClick(event) {
    event.preventDefault()
    event.stopPropagation()
    onDeleteRequest(plan)
  }

  return (
    <Link to={`/workout-plans/${plan._id}`}>
      <Card
        className={cn(
          "h-full transition-colors hover:bg-muted/50",
          isActive &&
            "border-primary shadow-[0_0_0_1px] shadow-primary ring-4 ring-primary/20 hover:bg-transparent"
        )}
      >
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>{plan.name}</CardTitle>
            {isActive && (
              <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                Aktivan
              </span>
            )}
          </div>
          <CardDescription>
            {plan.days.length} {plan.days.length === 1 ? "dan" : "dana"}
          </CardDescription>
          <CardAction className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleEditClick}>
              <Pencil />
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDeleteClick}>
              <Trash2 />
            </Button>
          </CardAction>
        </CardHeader>
      </Card>
    </Link>
  )
}

export default function WorkoutPlans() {
  const { user } = useAuth()
  const [plans, setPlans] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    getWorkoutPlansRequest()
      .then(setPlans)
      .catch((error) => {
        toast.error(error.response?.data?.message || "Neuspešno učitavanje planova")
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function handleDelete() {
    if (!deleteTarget) return

    setIsDeleting(true)
    try {
      await deleteWorkoutPlanRequest(deleteTarget._id)
      setPlans((prev) => prev.filter((item) => item._id !== deleteTarget._id))
      toast.success("Plan je obrisan")
      setDeleteTarget(null)
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("Nemaš dozvolu da obrišeš ovaj plan")
      } else {
        toast.error(error.response?.data?.message || "Brisanje plana nije uspelo")
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const trimmedQuery = query.trim().toLowerCase()
  const visiblePlans = trimmedQuery
    ? plans.filter((plan) => plan.name.toLowerCase().includes(trimmedQuery))
    : plans

  return (
    <AppLayout breadcrumb="Planovi treninga">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="w-56 pl-8"
            placeholder="Pretraži planove..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Button asChild>
          <Link to="/workout-plans/new">
            <Plus />
            Novi plan
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <CardGridSkeleton />
      ) : visiblePlans.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Nema planova za prikaz"
          description={
            plans.length === 0
              ? "Napravi svoj prvi plan treninga da počneš sa vežbanjem."
              : "Promeni pretragu da vidiš druge planove."
          }
          action={
            plans.length === 0 && (
              <Button asChild size="sm">
                <Link to="/workout-plans/new">
                  <Plus />
                  Novi plan
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <CardGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePlans.map((plan) => (
            <CardGridItem key={plan._id}>
              <PlanCard
                plan={plan}
                isActive={plan._id === user?.activeWorkoutPlan}
                onDeleteRequest={setDeleteTarget}
              />
            </CardGridItem>
          ))}
        </CardGrid>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Da li si siguran da želiš da obrišeš plan &quot;{deleteTarget?.name}&quot;? Ova akcija
              se ne može poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Otkaži</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Brisanje..." : "Obriši"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
