import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
import { Plus, Scale, Trash2 } from "lucide-react"

import { deleteWeightLogRequest, getWeightLogsRequest, logWeightRequest } from "@/api/weightLogs"
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
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CardGrid, CardGridItem } from "@/components/ui/card-grid"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { WeightHistoryChart } from "@/components/weight-history-chart"

function todayDateString() {
  return new Date().toISOString().slice(0, 10)
}

export default function BodyWeight() {
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
    getWeightLogsRequest()
      .then(setLogs)
      .catch((error) => {
        toast.error(error.response?.data?.message || t("bodyWeight.errors.loadFailed"))
      })
      .finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadNonce])

  function openAddForm() {
    setForm({ date: today, weight: "" })
    setIsFormOpen(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const weightNumber = Number(form.weight)
    if (!(weightNumber > 0)) {
      toast.error(t("bodyWeight.errors.invalidWeight"))
      return
    }

    setIsSubmitting(true)
    try {
      await logWeightRequest({ date: form.date, weight: weightNumber })
      toast.success(t("bodyWeight.success.saved"))
      setIsFormOpen(false)
      setReloadNonce((prev) => prev + 1)
    } catch (error) {
      toast.error(error.response?.data?.message || t("bodyWeight.errors.saveFailed"))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return

    setIsDeleting(true)
    try {
      await deleteWeightLogRequest(deleteTarget._id)
      toast.success(t("bodyWeight.success.deleted"))
      setDeleteTarget(null)
      setReloadNonce((prev) => prev + 1)
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(t("bodyWeight.errors.deleteForbidden"))
      } else {
        toast.error(error.response?.data?.message || t("bodyWeight.errors.deleteFailed"))
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const latest = logs[0]

  return (
    <AppLayout breadcrumb={t("sidebar.nav.bodyWeight")}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-2xl font-semibold">
            {latest ? `${latest.weight} kg` : "—"}
          </span>
          <span className="text-sm text-muted-foreground">
            {latest
              ? t("bodyWeight.lastMeasurement", { date: latest.date.slice(0, 10) })
              : t("bodyWeight.noMeasurements")}
          </span>
        </div>
        <Button onClick={openAddForm}>
          <Plus />
          {t("bodyWeight.addMeasurement")}
        </Button>
      </div>

      {isLoading ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{t("bodyWeight.history")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} size="sm">
                <CardHeader>
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-20" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={Scale}
          title={t("bodyWeight.emptyState.title")}
          description={t("bodyWeight.emptyState.description")}
          action={
            <Button size="sm" onClick={openAddForm}>
              <Plus />
              {t("bodyWeight.addMeasurement")}
            </Button>
          }
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{t("bodyWeight.history")}</CardTitle>
            </CardHeader>
            <CardContent>
              <WeightHistoryChart logs={logs} />
            </CardContent>
          </Card>

          <CardGrid className="flex flex-col gap-2">
            {logs.map((log) => (
              <CardGridItem key={log._id} hover={false}>
                <Card size="sm">
                  <CardHeader>
                    <CardTitle className="text-sm">{log.weight} kg</CardTitle>
                    <span className="text-xs text-muted-foreground">{log.date.slice(0, 10)}</span>
                    <CardAction>
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        onClick={() => setDeleteTarget(log)}
                      >
                        <Trash2 />
                      </Button>
                    </CardAction>
                  </CardHeader>
                </Card>
              </CardGridItem>
            ))}
          </CardGrid>
        </>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("bodyWeight.form.title")}</DialogTitle>
            <DialogDescription>{t("bodyWeight.form.description")}</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="weight-log-date">{t("bodyWeight.form.dateLabel")}</FieldLabel>
                <Input
                  id="weight-log-date"
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
                <FieldLabel htmlFor="weight-log-weight">{t("bodyWeight.form.weightLabel")}</FieldLabel>
                <Input
                  id="weight-log-weight"
                  type="number"
                  step="0.1"
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
                {isSubmitting ? t("bodyWeight.form.saving") : t("bodyWeight.form.save")}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                {t("bodyWeight.form.cancel")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("bodyWeight.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("bodyWeight.deleteDialog.description", {
                date: deleteTarget?.date?.slice(0, 10),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("bodyWeight.deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? t("bodyWeight.deleteDialog.deleting") : t("bodyWeight.deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
