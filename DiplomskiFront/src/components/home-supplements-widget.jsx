import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
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
import { Skeleton } from "@/components/ui/skeleton"
import { UserSupplementForm } from "@/components/user-supplement-form"
import { cn, formatFullDateLabel } from "@/lib/utils"

function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function HomeSupplementsWidget({ date, onSupplementChange }) {
  const { t } = useTranslation()
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
  const [detailEntry, setDetailEntry] = useState(null)

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
        toast.error(error.response?.data?.message || t("home.supplementsWidget.toasts.loadError"))
      })
      .finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      onSupplementChange?.()
    } catch (error) {
      setTakenMap((prev) => ({ ...prev, [userSupplementId]: !nextTaken }))
      toast.error(error.response?.data?.message || t("home.supplementsWidget.toasts.saveError"))
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
              {isToday
                ? t("home.supplementsWidget.titleToday")
                : t("home.supplementsWidget.titleForDate", { date: formatFullDateLabel(selectedDate) })}
            </p>
            <p className="truncate text-xs text-muted-foreground">{t("home.supplementsWidget.subtitle")}</p>
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
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              {userSupplements.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t("home.supplementsWidget.noSupplements")}
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
                          role="button"
                          tabIndex={0}
                          onClick={() => setDetailEntry({ item, supplement })}
                          onKeyDown={(event) => {
                            if (event.key !== "Enter" && event.key !== " ") return
                            event.preventDefault()
                            setDetailEntry({ item, supplement })
                          }}
                          className="flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50"
                        >
                          <span className="truncate">
                            {supplement?.name ?? t("home.supplementsWidget.unknownSupplement")}
                          </span>
                          <span className="ml-auto shrink-0 text-xs">{item.dosage}</span>
                        </div>
                      )
                    }

                    return (
                      <div
                        key={item._id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setDetailEntry({ item, supplement })}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter" && event.key !== " ") return
                          event.preventDefault()
                          setDetailEntry({ item, supplement })
                        }}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1.5 text-sm transition-colors hover:bg-muted/50"
                      >
                        <span onClick={(event) => event.stopPropagation()}>
                          <Checkbox
                            checked={taken}
                            onCheckedChange={(checked) => handleToggle(item._id, checked === true)}
                          />
                        </span>
                        <span
                          className={cn(
                            "truncate",
                            taken && "text-muted-foreground line-through"
                          )}
                        >
                          {supplement?.name ?? t("home.supplementsWidget.unknownSupplement")}
                        </span>
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                          {item.dosage}
                        </span>
                      </div>
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
                {t("home.supplementsWidget.addSupplement")}
              </Button>
            )}
          </>
        )}
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("home.supplementsWidget.addDialog.title")}</DialogTitle>
            <DialogDescription>{t("home.supplementsWidget.addDialog.description")}</DialogDescription>
          </DialogHeader>
          {isFormOpen && (
            <UserSupplementForm
              onSaved={handleSupplementSaved}
              onCancel={() => setIsFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailEntry} onOpenChange={(open) => !open && setDetailEntry(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{detailEntry?.supplement?.name ?? t("home.supplementsWidget.unknownSupplement")}</DialogTitle>
            <DialogDescription>
              {[detailEntry?.item?.dosage, detailEntry?.item?.timeOfDay]
                .filter(Boolean)
                .join(" • ")}
            </DialogDescription>
          </DialogHeader>
          {detailEntry?.supplement?.imageUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
              <img
                src={detailEntry.supplement.imageUrl}
                alt=""
                className="h-full w-full object-contain"
              />
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            {detailEntry?.supplement?.description || t("home.supplementsWidget.detailDialog.noDescription")}
          </p>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
