import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { Pill, Plus } from "lucide-react"

import {
  getSupplementLogsRequest,
  getSupplementsRequest,
  getUserSupplementsRequest,
  logSupplementTakenRequest,
} from "@/api/supplements"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { UserSupplementForm } from "@/components/user-supplement-form"
import { cn, formatFullDateLabel } from "@/lib/utils"

function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function HomeSupplementsWidget({ date }) {
  const selectedDate = useMemo(() => date ?? new Date(), [date])
  const dateKey = useMemo(() => toDateKey(selectedDate), [selectedDate])
  const todayKey = useMemo(() => toDateKey(new Date()), [])
  const isToday = dateKey === todayKey
  const isFuture = dateKey > todayKey

  const [userSupplements, setUserSupplements] = useState([])
  const [supplements, setSupplements] = useState([])
  const [takenMap, setTakenMap] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      getUserSupplementsRequest(),
      getSupplementsRequest(),
      getSupplementLogsRequest({ date: dateKey }),
    ])
      .then(([userSupplementsData, supplementsData, logsData]) => {
        setUserSupplements(userSupplementsData.filter((item) => item.active))
        setSupplements(supplementsData)
        const map = {}
        logsData.forEach((log) => {
          map[log.supplement] = log.taken
        })
        setTakenMap(map)
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Neuspešno učitavanje suplemenata")
      })
      .finally(() => setIsLoading(false))
  }, [dateKey])

  const supplementById = useMemo(() => {
    const map = new Map()
    supplements.forEach((supplement) => map.set(supplement._id, supplement))
    return map
  }, [supplements])

  const takenCount = userSupplements.filter((item) => takenMap[item._id]).length
  const progress = userSupplements.length > 0 ? (takenCount / userSupplements.length) * 100 : 0

  async function handleToggle(userSupplementId, nextTaken) {
    setTakenMap((prev) => ({ ...prev, [userSupplementId]: nextTaken }))
    try {
      await logSupplementTakenRequest({
        supplement: userSupplementId,
        date: dateKey,
        taken: nextTaken,
      })
    } catch (error) {
      setTakenMap((prev) => ({ ...prev, [userSupplementId]: !nextTaken }))
      toast.error(error.response?.data?.message || "Čuvanje nije uspelo")
    }
  }

  function handleSupplementSaved(saved) {
    setIsFormOpen(false)
    if (saved.active) {
      setUserSupplements((prev) => [...prev, saved])
    }
  }

  return (
    <Card className="flex h-80 flex-col overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Pill className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-medium">
              {isToday ? "Suplementi danas" : `Suplementi — ${formatFullDateLabel(selectedDate)}`}
            </p>
            <p className="truncate text-xs text-muted-foreground">Tvoj dnevni režim</p>
          </div>
          {userSupplements.length > 0 && (
            <span className="shrink-0 text-xs font-medium text-muted-foreground">
              {takenCount}/{userSupplements.length}
            </span>
          )}
        </div>
        {userSupplements.length > 0 && (
          <Progress
            value={progress}
            className="mt-3 [&>[data-slot=progress-indicator]]:bg-violet-500"
          />
        )}
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Učitavanje...</p>
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              {userSupplements.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nemaš aktivnih suplemenata u režimu
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {userSupplements.map((item) => {
                    const supplement = supplementById.get(item.supplement)
                    const taken = Boolean(takenMap[item._id])

                    if (isFuture) {
                      return (
                        <div
                          key={item._id}
                          className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-sm text-muted-foreground"
                        >
                          <span className="truncate">
                            {supplement?.name ?? "Nepoznat suplement"}
                          </span>
                          <span className="ml-auto shrink-0 text-xs">{item.dosage}</span>
                        </div>
                      )
                    }

                    return (
                      <label
                        key={item._id}
                        className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-sm transition-colors hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={taken}
                          onCheckedChange={(checked) => handleToggle(item._id, checked === true)}
                        />
                        <span
                          className={cn(
                            "truncate",
                            taken && "text-muted-foreground line-through"
                          )}
                        >
                          {supplement?.name ?? "Nepoznat suplement"}
                        </span>
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                          {item.dosage}
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            {!isFuture && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 self-start"
                onClick={() => setIsFormOpen(true)}
              >
                <Plus />
                Dodaj suplement
              </Button>
            )}
          </>
        )}
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dodaj suplement</DialogTitle>
            <DialogDescription>Dodaj suplement iz kataloga u svoj režim.</DialogDescription>
          </DialogHeader>
          {isFormOpen && (
            <UserSupplementForm
              onSaved={handleSupplementSaved}
              onCancel={() => setIsFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
