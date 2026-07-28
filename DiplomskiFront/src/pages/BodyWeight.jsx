import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { Plus, Trash2 } from "lucide-react"

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { WeightHistoryChart } from "@/components/weight-history-chart"

function todayDateString() {
  return new Date().toISOString().slice(0, 10)
}

export default function BodyWeight() {
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
        toast.error(error.response?.data?.message || "Neuspešno učitavanje istorije težine")
      })
      .finally(() => setIsLoading(false))
  }, [reloadNonce])

  function openAddForm() {
    setForm({ date: today, weight: "" })
    setIsFormOpen(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const weightNumber = Number(form.weight)
    if (!(weightNumber > 0)) {
      toast.error("Unesi validnu težinu")
      return
    }

    setIsSubmitting(true)
    try {
      await logWeightRequest({ date: form.date, weight: weightNumber })
      toast.success("Merenje je sačuvano")
      setIsFormOpen(false)
      setReloadNonce((prev) => prev + 1)
    } catch (error) {
      toast.error(error.response?.data?.message || "Čuvanje nije uspelo")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return

    setIsDeleting(true)
    try {
      await deleteWeightLogRequest(deleteTarget._id)
      toast.success("Merenje je obrisano")
      setDeleteTarget(null)
      setReloadNonce((prev) => prev + 1)
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("Nemaš dozvolu da obrišeš ovaj zapis")
      } else {
        toast.error(error.response?.data?.message || "Brisanje nije uspelo")
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const latest = logs[0]

  return (
    <AppLayout breadcrumb="Telesna težina">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-2xl font-semibold">
            {latest ? `${latest.weight} kg` : "—"}
          </span>
          <span className="text-sm text-muted-foreground">
            {latest ? `Poslednje merenje: ${latest.date.slice(0, 10)}` : "Nema unetih merenja"}
          </span>
        </div>
        <Button onClick={openAddForm}>
          <Plus />
          Dodaj merenje
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Učitavanje...</p>
      ) : logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nema unetih merenja</p>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Istorija</CardTitle>
            </CardHeader>
            <CardContent>
              <WeightHistoryChart logs={logs} />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            {logs.map((log) => (
              <Card key={log._id} size="sm">
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
            ))}
          </div>
        </>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Dodaj merenje</DialogTitle>
            <DialogDescription>Unesi datum i izmerenu težinu.</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="weight-log-date">Datum</FieldLabel>
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
                <FieldLabel htmlFor="weight-log-weight">Težina (kg)</FieldLabel>
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
                {isSubmitting ? "Čuvanje..." : "Sačuvaj"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Otkaži
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati merenje?</AlertDialogTitle>
            <AlertDialogDescription>
              Da li si siguran da želiš da obrišeš merenje od {deleteTarget?.date?.slice(0, 10)}?
              Ova akcija se ne može poništiti.
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
