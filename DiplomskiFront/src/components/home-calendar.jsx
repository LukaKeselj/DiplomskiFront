import { useEffect, useMemo, useState } from "react"
import { CalendarDays, ChevronDown } from "lucide-react"
import { srLatn } from "date-fns/locale"

import { getDailySummaryRequest } from "@/api/nutrition"
import { getWeightLogsRequest } from "@/api/weightLogs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Skeleton } from "@/components/ui/skeleton"
import { WeightHistoryChart } from "@/components/weight-history-chart"
import { cn, formatFullDateLabel } from "@/lib/utils"

function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const SUMMARY_ITEMS = [
  { key: "calories", label: "Kalorije", unit: "kcal", color: "text-orange-600 dark:text-orange-400" },
  { key: "protein", label: "Proteini", unit: "g", color: "text-rose-600 dark:text-rose-400" },
  { key: "fat", label: "Masti", unit: "g", color: "text-violet-600 dark:text-violet-400" },
  { key: "carbs", label: "UH", unit: "g", color: "text-blue-600 dark:text-blue-400" },
]

export function HomeCalendar({ selectedDate, onSelectDate, refreshKey }) {
  const [isOpen, setIsOpen] = useState(false)
  const [weightLogs, setWeightLogs] = useState([])
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const dateKey = useMemo(() => toDateKey(selectedDate), [selectedDate])
  const todayKey = useMemo(() => toDateKey(new Date()), [])
  const isToday = dateKey === todayKey

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false

    Promise.all([getWeightLogsRequest(), getDailySummaryRequest(dateKey)])
      .then(([weightData, summaryData]) => {
        if (cancelled) return
        setWeightLogs(weightData)
        setSummary(summaryData)
      })
      .catch(() => {})
      .finally(() => !cancelled && setIsLoading(false))

    return () => {
      cancelled = true
    }
  }, [isOpen, dateKey, refreshKey])

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
      <Card className="group/calendar">
        <CardHeader>
          <CollapsibleTrigger asChild>
            <button type="button" className="flex w-full items-center gap-2 text-left">
              <CalendarDays className="size-4 text-muted-foreground" />
              <div className="flex-1">
                <span className="font-heading text-sm font-medium">Kalendar</span>
                <span className="block text-xs text-muted-foreground">
                  {formatFullDateLabel(selectedDate)}
                </span>
              </div>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/calendar:rotate-180" />
            </button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">{formatFullDateLabel(selectedDate)}</h3>
              {!isToday && (
                <Button size="sm" variant="ghost" onClick={() => onSelectDate(new Date())}>
                  Danas
                </Button>
              )}
            </div>

            <div className="grid items-stretch gap-4 md:grid-cols-[auto_1fr]">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && onSelectDate(date)}
                locale={srLatn}
                className="rounded-md border p-2"
              />
              <div className="rounded-lg border border-border p-3">
                <h4 className="mb-2 text-xs font-medium text-muted-foreground">Napredak težine</h4>
                {isLoading ? (
                  <Skeleton className="h-40 w-full" />
                ) : weightLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nema unetih merenja težine</p>
                ) : (
                  <WeightHistoryChart logs={weightLogs} className="aspect-auto h-40" />
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border p-3">
              <h4 className="mb-2 text-xs font-medium text-muted-foreground">Ishrana ovog dana</h4>
              {isLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {SUMMARY_ITEMS.map((item) => (
                    <div key={item.key} className="flex flex-col gap-0.5">
                      <span className={cn("text-lg font-semibold", item.color)}>
                        {summary?.[item.key] ?? 0}
                        <span className="ml-1 text-sm font-normal text-muted-foreground">
                          {item.unit}
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
