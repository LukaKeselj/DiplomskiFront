import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
import { Plus, Trash2 } from "lucide-react"

import { deleteWorkoutLogRequest, getWorkoutLogsRequest, logWorkoutWeightRequest } from "@/api/workoutLogs"
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
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { WeightHistoryChart } from "@/components/weight-history-chart"

function todayDateString() {
  return new Date().toISOString().slice(0, 10)
}

export function ExerciseProgress({ exerciseId }) {
  const { t } = useTranslation()
  const today = useMemo(() => todayDateString(), [])
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState({ date: today, weight: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [reloadNonce, setReloadNonce] = useState(0)

  useEffect(() => {
    getWorkoutLogsRequest({ exercise: exerciseId })
      .then(setLogs)
      .catch((error) => {
        toast.error(error.response?.data?.message || t("exercises.progress.card.toasts.loadFailed"))
      })
      .finally(() => setIsLoading(false))
  }, [exerciseId, reloadNonce, t])

  function openAddForm() {
    setForm({ date: today, weight: "" })
    setIsFormOpen(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const weightNumber = Number(form.weight)
    if (!(weightNumber > 0)) {
      toast.error(t("exercises.progress.card.toasts.invalidWeight"))
      return
    }

    setIsSubmitting(true)
    try {
      await logWorkoutWeightRequest({ exercise: exerciseId, date: form.date, weight: weightNumber })
      toast.success(t("exercises.progress.card.toasts.saveSuccess"))
      setIsFormOpen(false)
      setReloadNonce((prev) => prev + 1)
    } catch (error) {
      toast.error(error.response?.data?.message || t("exercises.progress.card.toasts.saveFailed"))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return

    setIsDeleting(true)
    try {
      await deleteWorkoutLogRequest(deleteTarget._id)
      toast.success(t("exercises.progress.card.toasts.deleteSuccess"))
      setDeleteTarget(null)
      setReloadNonce((prev) => prev + 1)
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(t("exercises.progress.card.toasts.deleteForbidden"))
      } else {
        toast.error(error.response?.data?.message || t("exercises.progress.card.toasts.deleteFailed"))
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const latest = logs[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("exercises.progress.card.title")}</CardTitle>
        <CardDescription>
          {latest
            ? t("exercises.progress.card.latestLabel", {
                weight: latest.weight,
                date: latest.date.slice(0, 10),
              })
            : t("exercises.progress.card.noEntries")}
        </CardDescription>
        <CardAction>
          <Button size="sm" onClick={openAddForm}>
            <Plus />
            {t("exercises.progress.card.logWeight")}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("exercises.progress.card.emptyHint")}
          </p>
        ) : (
          <>
            <WeightHistoryChart logs={logs} />
            <div className="flex flex-col gap-2">
              {logs.map((log) => (
                <div
                  key={log._id}
                  className="flex items-center justify-between rounded-lg border border-border p-2.5 text-sm"
                >
                  <span className="text-muted-foreground">{log.date.slice(0, 10)}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{log.weight} kg</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteTarget(log)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("exercises.progress.card.dialog.title")}</DialogTitle>
            <DialogDescription>{t("exercises.progress.card.dialog.description")}</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="workout-log-date">{t("exercises.progress.card.dialog.dateLabel")}</FieldLabel>
                <Input
                  id="workout-log-date"
                  type="date"
                  max={today}
                  value={form.date}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      date: event.target.value > today ? today : event.target.value,
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="workout-log-weight">{t("exercises.progress.card.dialog.weightLabel")}</FieldLabel>
                <Input
                  id="workout-log-weight"
                  type="number"
                  step="0.5"
                  min="0"
                  value={form.weight}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, weight: event.target.value }))
                  }
                />
              </Field>
            </FieldGroup>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("exercises.progress.card.dialog.saving") : t("exercises.progress.card.dialog.save")}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                {t("exercises.progress.card.dialog.cancel")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("exercises.progress.card.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("exercises.progress.card.deleteDialog.description", {
                date: deleteTarget?.date?.slice(0, 10),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("exercises.progress.card.deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting
                ? t("exercises.progress.card.deleteDialog.confirming")
                : t("exercises.progress.card.deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
