import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
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
import { CardGrid, CardGridItem } from "@/components/ui/card-grid"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { getNutritionCycleDayIndex, isBeforeActivation } from "@/lib/nutrition-cycle"

export default function NutritionPlanDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const [plan, setPlan] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isActivating, setIsActivating] = useState(false)

  const isActivePlan = user?.activeNutritionPlan === id

  const activeNutritionPlanStartDate = user?.activeNutritionPlanStartDate

  const todayDayIndex = useMemo(() => {
    if (!isActivePlan || !plan?.days?.length) return -1
    if (isBeforeActivation(activeNutritionPlanStartDate, new Date())) return -1
    return getNutritionCycleDayIndex(activeNutritionPlanStartDate, new Date(), plan.days.length)
  }, [isActivePlan, plan, activeNutritionPlanStartDate])

  useEffect(() => {
    getNutritionPlanRequest(id)
      .then(setPlan)
      .catch((error) => {
        if (error.response?.status === 403) {
          toast.error(t("nutrition.planDetail.accessDenied"))
        } else {
          toast.error(error.response?.data?.message || t("nutrition.planDetail.notFound"))
        }
        navigate("/nutrition-plans")
      })
      .finally(() => setIsLoading(false))
  }, [id, navigate, t])

  async function handleActivate() {
    setIsActivating(true)
    try {
      const updatedUser = await activateNutritionPlanRequest(id)
      updateUser(updatedUser)
      toast.success(t("nutrition.planDetail.activateSuccess"))
    } catch (error) {
      toast.error(error.response?.data?.message || t("nutrition.planDetail.activateFailed"))
    } finally {
      setIsActivating(false)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteNutritionPlanRequest(id)
      toast.success(t("nutrition.planDetail.deleteSuccess"))
      navigate("/nutrition-plans")
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(t("nutrition.planDetail.deleteForbidden"))
      } else {
        toast.error(error.response?.data?.message || t("nutrition.planDetail.deleteFailed"))
      }
      setIsDeleting(false)
    }
  }

  return (
    <AppLayout breadcrumb={plan?.name ?? t("nutrition.planDetail.breadcrumbFallback")}>
      {isLoading ? (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-9 w-24" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : plan ? (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-medium">{plan.name}</h1>
              {isActivePlan && (
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {t("nutrition.planDetail.activeBadge")}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {!isActivePlan && (
                <Button onClick={handleActivate} disabled={isActivating}>
                  {isActivating ? t("nutrition.planDetail.activating") : t("nutrition.planDetail.activate")}
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link to={`/nutrition-plans/${plan._id}/edit`}>
                  <Pencil />
                  {t("nutrition.planDetail.edit")}
                </Link>
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isDeleting}
              >
                <Trash2 />
                {isDeleting ? t("nutrition.planDetail.deleting") : t("nutrition.planDetail.delete")}
              </Button>
            </div>
          </div>

          <CardGrid className="contents">
            {plan.days.map((day, dayIndex) => {
              const items = day.items ?? []
              const isToday = dayIndex === todayDayIndex
              return (
                <CardGridItem key={day._id ?? dayIndex} hover={false}>
                  <Card
                    className={cn(
                      isToday &&
                        "border-primary shadow-[0_0_0_1px] shadow-primary ring-4 ring-primary/20"
                    )}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <CardTitle>{day.dayName}</CardTitle>
                        {isToday && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {t("nutrition.planDetail.todayBadge")}
                          </span>
                        )}
                      </div>
                      <CardDescription>
                        {items.length === 0
                          ? t("nutrition.planDetail.noItems")
                          : t("nutrition.planDetail.itemsCount", { count: items.length })}
                      </CardDescription>
                    </CardHeader>
                    {items.length > 0 && (
                      <CardContent className="flex flex-col gap-1.5">
                        {items.map((item) => (
                          <div
                            key={item._id}
                            className="flex flex-col gap-0.5 rounded-lg border px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <span className="text-sm font-medium">{item.foodName}</span>
                            <span className="text-xs text-muted-foreground">
                              {t("nutrition.planDetail.itemMacros", {
                                calories: item.calories,
                                protein: item.protein,
                                fat: item.fat,
                                carbs: item.carbs,
                              })}
                            </span>
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                </CardGridItem>
              )
            })}
          </CardGrid>

          <Button variant="outline" onClick={() => navigate("/nutrition-plans")}>
            {t("nutrition.planDetail.backToList")}
          </Button>
        </div>
      ) : null}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("nutrition.planDetail.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("nutrition.planDetail.deleteDialog.description", { name: plan?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("nutrition.planDetail.deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              {t("nutrition.planDetail.deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
