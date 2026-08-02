import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
import { ChevronRight, Pencil, Trash2 } from "lucide-react"

import { deleteWorkoutPlanRequest, getWorkoutPlanRequest } from "@/api/workoutPlans"
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
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/context/AuthContext"
import { useActivateWorkoutPlan } from "@/hooks/use-activate-workout-plan"
import { getWorkoutScheduleForDate } from "@/lib/workout-cycle"

export default function WorkoutPlanDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [plan, setPlan] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { isActivating, activate } = useActivateWorkoutPlan()

  const isActivePlan = user?.activeWorkoutPlan === id

  useEffect(() => {
    getWorkoutPlanRequest(id)
      .then(setPlan)
      .catch((error) => {
        if (error.response?.status === 403) {
          toast.error(t("workout.detail.toasts.accessDenied"))
        } else {
          toast.error(error.response?.data?.message || t("workout.detail.toasts.notFound"))
        }
        navigate("/workout-plans")
      })
      .finally(() => setIsLoading(false))
  }, [id, navigate, t])

  const scheduledToday = useMemo(() => {
    if (!isActivePlan || !plan) return null
    return getWorkoutScheduleForDate(plan, user?.activeWorkoutPlanStartDate, new Date())
  }, [isActivePlan, plan, user?.activeWorkoutPlanStartDate])

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteWorkoutPlanRequest(id)
      toast.success(t("workout.detail.toasts.deleteSuccess"))
      navigate("/workout-plans")
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(t("workout.detail.toasts.deleteForbidden"))
      } else {
        toast.error(error.response?.data?.message || t("workout.detail.toasts.deleteFailed"))
      }
      setIsDeleting(false)
    }
  }

  return (
    <AppLayout breadcrumb={plan?.name ?? t("workout.detail.breadcrumbFallback")}>
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
                  {t("workout.detail.active")}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {!isActivePlan && (
                <Button onClick={() => activate(id)} disabled={isActivating}>
                  {isActivating ? t("workout.detail.activating") : t("workout.detail.activate")}
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link to={`/workout-plans/${plan._id}/edit`}>
                  <Pencil />
                  {t("workout.detail.edit")}
                </Link>
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isDeleting}
              >
                <Trash2 />
                {isDeleting ? t("workout.detail.deleting") : t("workout.detail.delete")}
              </Button>
            </div>
          </div>

          <CardGrid className="contents">
            {plan.days.map((day) => (
              <CardGridItem key={day._id}>
                <Link to={`/workout-plans/${plan._id}/days/${day._id}`}>
                  <Card className="transition-colors hover:bg-muted/50">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <CardTitle>{day.dayName}</CardTitle>
                        {scheduledToday?.day?._id === day._id && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {t("workout.detail.nextBadge")}
                          </span>
                        )}
                      </div>
                      <CardDescription>
                        {day.exercises.length}{" "}
                        {t(
                          day.exercises.length === 1
                            ? "workout.detail.dayCard.exerciseCount.one"
                            : "workout.detail.dayCard.exerciseCount.other"
                        )}
                      </CardDescription>
                      <CardAction>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </CardAction>
                    </CardHeader>
                  </Card>
                </Link>
              </CardGridItem>
            ))}
          </CardGrid>

          <Button variant="outline" onClick={() => navigate("/workout-plans")}>
            {t("workout.detail.backToList")}
          </Button>
        </div>
      ) : null}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("workout.detail.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("workout.detail.deleteDialog.description", { name: plan?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("workout.detail.deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              {t("workout.detail.deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
