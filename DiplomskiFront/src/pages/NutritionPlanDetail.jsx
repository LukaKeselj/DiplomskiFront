import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import toast from "react-hot-toast"
import { Pencil, Trash2 } from "lucide-react"

import {
  activateNutritionPlanRequest,
  deleteNutritionPlanRequest,
  getNutritionPlanRequest,
} from "@/api/nutritionPlans"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"
import { DAYS_OF_WEEK_DISPLAY_ORDER, DAYS_OF_WEEK } from "@/lib/days-of-week"

const dayLabelByValue = new Map(DAYS_OF_WEEK.map((d) => [d.value, d.label]))

export default function NutritionPlanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const [plan, setPlan] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isActivating, setIsActivating] = useState(false)

  const isActivePlan = user?.activeNutritionPlan === id

  useEffect(() => {
    getNutritionPlanRequest(id)
      .then(setPlan)
      .catch((error) => {
        if (error.response?.status === 403) {
          toast.error("Nemaš pristup ovom planu")
        } else {
          toast.error(error.response?.data?.message || "Plan nije pronađen")
        }
        navigate("/nutrition-plans")
      })
      .finally(() => setIsLoading(false))
  }, [id, navigate])

  async function handleActivate() {
    setIsActivating(true)
    try {
      const updatedUser = await activateNutritionPlanRequest(id)
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
      await deleteNutritionPlanRequest(id)
      toast.success("Plan je obrisan")
      navigate("/nutrition-plans")
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
    <AppLayout breadcrumb={plan?.name ?? "Plan ishrane"}>
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
                <Link to={`/nutrition-plans/${plan._id}/edit`}>
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

          {DAYS_OF_WEEK_DISPLAY_ORDER.map((dayOfWeek) => {
            const day = plan.days.find((d) => d.dayOfWeek === dayOfWeek)
            const items = day?.items ?? []
            return (
              <Card key={dayOfWeek}>
                <CardHeader>
                  <CardTitle>{dayLabelByValue.get(dayOfWeek)}</CardTitle>
                  <CardDescription>
                    {items.length === 0
                      ? "Nema planiranih namirnica"
                      : `${items.length} ${items.length === 1 ? "namirnica" : "namirnica"}`}
                  </CardDescription>
                </CardHeader>
                {items.length > 0 && (
                  <CardContent className="flex flex-col gap-1.5">
                    {items.map((item) => (
                      <div key={item._id} className="flex items-center justify-between text-sm">
                        <span>{item.foodName}</span>
                        <span className="text-muted-foreground">
                          {item.calories} kcal • {item.protein}g protein • {item.fat}g masti •{" "}
                          {item.carbs}g UH
                        </span>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            )
          })}

          <Button variant="outline" onClick={() => navigate("/nutrition-plans")}>
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
