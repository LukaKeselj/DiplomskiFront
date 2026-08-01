import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { BarChart3, Pencil, Plus, Trash2, UtensilsCrossed } from "lucide-react"

import {
  deleteNutritionLogRequest,
  getDailySummaryRequest,
  getNutritionLogsRequest,
} from "@/api/nutrition"
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
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CardGrid, CardGridItem } from "@/components/ui/card-grid"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { NutritionLogForm } from "@/components/nutrition-log-form"
import { NutritionWeeklyChart } from "@/components/nutrition-weekly-chart"
import { cn } from "@/lib/utils"

function todayDateString() {
  return new Date().toISOString().slice(0, 10)
}

const SUMMARY_ITEMS = [
  {
    key: "calories",
    label: "Kalorije",
    unit: "kcal",
    color: "text-orange-600 dark:text-orange-400",
  },
  {
    key: "protein",
    label: "Proteini",
    unit: "g",
    color: "text-rose-600 dark:text-rose-400",
  },
  { key: "fat", label: "Masti", unit: "g", color: "text-violet-600 dark:text-violet-400" },
  {
    key: "carbs",
    label: "Ugljeni hidrati",
    unit: "g",
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    key: "fiber",
    label: "Vlakna",
    unit: "g",
    color: "text-emerald-600 dark:text-emerald-400",
  },
]

const ENTRY_STATS = [
  { key: "calories", color: "text-orange-600 dark:text-orange-400", format: (v) => `${v} kcal` },
  { key: "protein", color: "text-rose-600 dark:text-rose-400", format: (v) => `${v}g protein` },
  { key: "fat", color: "text-violet-600 dark:text-violet-400", format: (v) => `${v}g masti` },
  { key: "carbs", color: "text-blue-600 dark:text-blue-400", format: (v) => `${v}g UH` },
  { key: "fiber", color: "text-emerald-600 dark:text-emerald-400", format: (v) => `${v}g vlakna` },
]

export default function NutritionLog() {
  const today = useMemo(() => todayDateString(), [])
  const [date, setDate] = useState(today)
  const [entries, setEntries] = useState([])
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingEntry, setEditingEntry] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [reloadNonce, setReloadNonce] = useState(0)
  const [isWeeklyChartOpen, setIsWeeklyChartOpen] = useState(false)

  useEffect(() => {
    Promise.all([getNutritionLogsRequest(date), getDailySummaryRequest(date)])
      .then(([logsData, summaryData]) => {
        setEntries(logsData)
        setSummary(summaryData)
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Neuspešno učitavanje dnevnika ishrane")
      })
      .finally(() => setIsLoading(false))
  }, [date, reloadNonce])

  function openAddForm() {
    setEditingEntry(null)
    setIsFormOpen(true)
  }

  function openEditForm(entry) {
    setEditingEntry(entry)
    setIsFormOpen(true)
  }

  function handleSaved() {
    setIsFormOpen(false)
    setEditingEntry(null)
    setReloadNonce((prev) => prev + 1)
  }

  async function handleDelete() {
    if (!deleteTarget) return

    setIsDeleting(true)
    try {
      await deleteNutritionLogRequest(deleteTarget._id)
      toast.success("Unos je obrisan")
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

  return (
    <AppLayout breadcrumb="Dnevnik ishrane">
      <div className="flex items-center justify-between gap-4">
        <Input
          type="date"
          className="w-48"
          max={today}
          value={date}
          onChange={(event) => setDate(event.target.value > today ? today : event.target.value)}
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsWeeklyChartOpen(true)}>
            <BarChart3 />
            Nedeljni pregled
          </Button>
          <Button onClick={openAddForm}>
            <Plus />
            Dodaj unos
          </Button>
        </div>
      </div>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Dnevni total</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {SUMMARY_ITEMS.map((item) => (
              <div key={item.key} className="flex flex-col gap-0.5">
                <span className={cn("text-lg font-semibold", item.color)}>
                  {summary[item.key]}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {item.unit}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="Nema unosa za izabrani dan"
          description="Dodaj šta si jeo/la da bi pratio unos kalorija i makronutrijenata."
          action={
            <Button size="sm" onClick={openAddForm}>
              <Plus />
              Dodaj unos
            </Button>
          }
        />
      ) : (
        <CardGrid className="flex flex-col gap-3">
          {entries.map((entry) => (
            <CardGridItem key={entry._id} hover={false}>
              <Card>
                <CardHeader>
                  <CardTitle>{entry.foodName}</CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-x-1.5">
                    {ENTRY_STATS.map((stat, index) => (
                      <span key={stat.key} className="flex items-center gap-1.5">
                        {index > 0 && <span className="text-muted-foreground">•</span>}
                        <span className={cn("font-medium", stat.color)}>
                          {stat.format(entry[stat.key])}
                        </span>
                      </span>
                    ))}
                  </CardDescription>
                  <CardAction className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => openEditForm(entry)}>
                      <Pencil />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => setDeleteTarget(entry)}>
                      <Trash2 />
                    </Button>
                  </CardAction>
                </CardHeader>
              </Card>
            </CardGridItem>
          ))}
        </CardGrid>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingEntry ? "Izmena unosa" : "Dodaj unos"}</DialogTitle>
            <DialogDescription>
              {editingEntry
                ? "Izmeni podatke o unetoj namirnici."
                : "Pretraži bazu hrane ili unesi podatke ručno."}
            </DialogDescription>
          </DialogHeader>
          {isFormOpen && (
            <NutritionLogForm
              date={date}
              entry={editingEntry}
              onSaved={handleSaved}
              onCancel={() => setIsFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isWeeklyChartOpen} onOpenChange={setIsWeeklyChartOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nedeljni pregled</DialogTitle>
            <DialogDescription>
              Raspodela kalorija po makroima za poslednjih 7 dana (zaključno sa {date}).
            </DialogDescription>
          </DialogHeader>
          {isWeeklyChartOpen && <NutritionWeeklyChart endDate={date} />}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati unos?</AlertDialogTitle>
            <AlertDialogDescription>
              Da li si siguran da želiš da obrišeš &quot;{deleteTarget?.foodName}&quot; iz
              dnevnika? Ova akcija se ne može poništiti.
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
