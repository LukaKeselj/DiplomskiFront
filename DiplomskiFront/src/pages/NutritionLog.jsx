import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { Pencil, Plus, Trash2 } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { NutritionLogForm } from "@/components/nutrition-log-form"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

function todayDateString() {
  return new Date().toISOString().slice(0, 10)
}

const SUMMARY_ITEMS = [
  { key: "calories", label: "Kalorije", unit: "kcal" },
  { key: "protein", label: "Proteini", unit: "g" },
  { key: "fat", label: "Masti", unit: "g" },
  { key: "carbs", label: "Ugljeni hidrati", unit: "g" },
  { key: "fiber", label: "Vlakna", unit: "g" },
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
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
        <Button onClick={openAddForm}>
          <Plus />
          Dodaj unos
        </Button>
      </div>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Dnevni total</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {SUMMARY_ITEMS.map((item) => (
              <div key={item.key} className="flex flex-col gap-0.5">
                <span className="text-lg font-medium">
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
        <p className="text-sm text-muted-foreground">Učitavanje...</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nema unosa za izabrani dan</p>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => (
            <Card key={entry._id}>
              <CardHeader>
                <CardTitle>{entry.foodName}</CardTitle>
                <CardDescription>
                  {entry.calories} kcal • {entry.protein}g protein • {entry.fat}g masti •{" "}
                  {entry.carbs}g UH • {entry.fiber}g vlakna
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
          ))}
        </div>
      )}

      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingEntry ? "Izmena unosa" : "Dodaj unos"}</SheetTitle>
            <SheetDescription>
              {editingEntry
                ? "Izmeni podatke o unetoj namirnici."
                : "Pretraži bazu hrane ili unesi podatke ručno."}
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">
            {isFormOpen && (
              <NutritionLogForm
                date={date}
                entry={editingEntry}
                onSaved={handleSaved}
                onCancel={() => setIsFormOpen(false)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

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
