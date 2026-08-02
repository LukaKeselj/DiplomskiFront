import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
import { Pencil, Plus, Search, Trash2, UtensilsCrossed } from "lucide-react"

import { deleteNutritionPlanRequest, getNutritionPlansRequest } from "@/api/nutritionPlans"
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
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CardGrid, CardGridItem } from "@/components/ui/card-grid"
import { CardGridSkeleton } from "@/components/ui/card-grid-skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"

function itemCount(plan) {
  return plan.days.reduce((total, day) => total + day.items.length, 0)
}

function PlanCard({ plan, isActive, onDeleteRequest }) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  function handleEditClick(event) {
    event.preventDefault()
    event.stopPropagation()
    navigate(`/nutrition-plans/${plan._id}/edit`)
  }

  function handleDeleteClick(event) {
    event.preventDefault()
    event.stopPropagation()
    onDeleteRequest(plan)
  }

  return (
    <Link to={`/nutrition-plans/${plan._id}`}>
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
                {t("nutrition.plans.activeBadge")}
              </span>
            )}
          </div>
          <CardDescription>
            {plan.days.length} {plan.days.length === 1 ? t("nutrition.plans.day") : t("nutrition.plans.days")}{" "}
            {t("nutrition.plans.inCycle")} • {itemCount(plan)} {t("nutrition.plans.foodItemsTotal")}
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

export default function NutritionPlans() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [plans, setPlans] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    getNutritionPlansRequest()
      .then(setPlans)
      .catch((error) => {
        toast.error(error.response?.data?.message || t("nutrition.plans.loadError"))
      })
      .finally(() => setIsLoading(false))
  }, [t])

  async function handleDelete() {
    if (!deleteTarget) return

    setIsDeleting(true)
    try {
      await deleteNutritionPlanRequest(deleteTarget._id)
      setPlans((prev) => prev.filter((item) => item._id !== deleteTarget._id))
      toast.success(t("nutrition.plans.deleteSuccess"))
      setDeleteTarget(null)
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(t("nutrition.plans.deleteForbidden"))
      } else {
        toast.error(error.response?.data?.message || t("nutrition.plans.deleteFailed"))
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
    <AppLayout breadcrumb={t("sidebar.nav.nutritionPlans")}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="w-56 pl-8"
            placeholder={t("nutrition.plans.searchPlaceholder")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Button asChild>
          <Link to="/nutrition-plans/new">
            <Plus />
            {t("nutrition.plans.newPlan")}
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <CardGridSkeleton />
      ) : visiblePlans.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title={t("nutrition.plans.empty.title")}
          description={
            plans.length === 0
              ? t("nutrition.plans.empty.descriptionEmpty")
              : t("nutrition.plans.empty.descriptionFiltered")
          }
          action={
            plans.length === 0 && (
              <Button asChild size="sm">
                <Link to="/nutrition-plans/new">
                  <Plus />
                  {t("nutrition.plans.newPlan")}
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
                isActive={plan._id === user?.activeNutritionPlan}
                onDeleteRequest={setDeleteTarget}
              />
            </CardGridItem>
          ))}
        </CardGrid>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("nutrition.plans.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("nutrition.plans.deleteDialog.description", { name: deleteTarget?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("nutrition.plans.deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? t("nutrition.plans.deleteDialog.deleting") : t("nutrition.plans.deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
