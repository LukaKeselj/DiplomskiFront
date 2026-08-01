import { useEffect, useState } from "react"
import { Link } from "react-router"
import { Apple, ChevronRight, Dumbbell, Gauge, Pill, Scale } from "lucide-react"

import { getFitnessScoreHistoryRequest } from "@/api/fitnessScore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const BREAKDOWN_ROWS = [
  { key: "workout", label: "Treninzi", icon: Dumbbell, emptyLabel: "Nema aktivnog plana" },
  { key: "nutrition", label: "Ishrana", icon: Apple, emptyLabel: "Nema unosa" },
  { key: "weight", label: "Težina", icon: Scale, emptyLabel: "Nije unešeno" },
  { key: "supplements", label: "Suplementi", icon: Pill, emptyLabel: "Nema aktivnih suplemenata" },
]

function scoreColor(score) {
  if (score === null) return "text-muted-foreground"
  if (score >= 70) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 40) return "text-amber-600 dark:text-amber-400"
  return "text-rose-600 dark:text-rose-400"
}

export function HomeFitnessScoreWidget({ refreshKey }) {
  const [weeks, setWeeks] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getFitnessScoreHistoryRequest(2)
      .then(setWeeks)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [refreshKey])

  const current = weeks?.[weeks.length - 1] ?? null
  const previous = weeks?.[weeks.length - 2] ?? null
  const delta =
    current?.overall != null && previous?.overall != null ? current.overall - previous.overall : null

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Gauge className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-medium">Fitness Score</p>
            <p className="truncate text-xs text-muted-foreground">Ova nedelja</p>
          </div>
          <Button size="sm" variant="ghost" asChild>
            <Link to="/fitness-score">
              Detalji
              <ChevronRight />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
        {isLoading ? (
          <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center">
            <Skeleton className="h-16 w-24 shrink-0" />
            <div className="flex flex-1 flex-col gap-2.5">
              {BREAKDOWN_ROWS.map((row) => (
                <Skeleton key={row.key} className="h-3 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex shrink-0 flex-col items-center justify-center gap-1 sm:w-28">
              <span className={cn("text-4xl font-bold tabular-nums", scoreColor(current?.overall ?? null))}>
                {current?.overall ?? "—"}
              </span>
              {delta !== null && delta !== 0 && (
                <span
                  className={cn(
                    "text-xs font-medium",
                    delta > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  )}
                >
                  {delta > 0 ? "+" : ""}
                  {delta} od prošle nedelje
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2.5">
              {BREAKDOWN_ROWS.map((row) => {
                const item = current?.breakdown?.[row.key]
                const Icon = row.icon
                return (
                  <div key={row.key} className="flex items-center gap-2.5">
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="w-20 shrink-0 text-xs text-muted-foreground">{row.label}</span>
                    {item?.score === null ? (
                      <span className="text-xs text-muted-foreground/70">{row.emptyLabel}</span>
                    ) : (
                      <>
                        <Progress value={item.score} className="h-1.5" />
                        <span className="w-9 shrink-0 text-right text-xs font-medium tabular-nums">
                          {item.score}%
                        </span>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
