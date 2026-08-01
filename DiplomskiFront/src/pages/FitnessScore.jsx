import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Apple, Dumbbell, Gauge, Pill, Scale } from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  XAxis,
  YAxis,
} from "recharts"

import { getFitnessScoreHistoryRequest } from "@/api/fitnessScore"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const WEEKS_TO_SHOW = 12

const BREAKDOWN_ROWS = [
  {
    key: "workout",
    label: "Treninzi",
    icon: Dumbbell,
    describe: (b) => (b.expected > 0 ? `${b.completed}/${b.expected} treninga` : "Nema aktivnog plana"),
  },
  {
    key: "nutrition",
    label: "Ishrana",
    icon: Apple,
    describe: (b) => `${b.loggedDays}/${b.totalDays} dana sa unosom`,
  },
  {
    key: "weight",
    label: "Težina",
    icon: Scale,
    describe: (b) => (b.logged ? "Uneta ove nedelje" : "Nije uneta ove nedelje"),
  },
  {
    key: "supplements",
    label: "Suplementi",
    icon: Pill,
    describe: (b) => (b.expected > 0 ? `${b.completed}/${b.expected} uzeto` : "Nema aktivnih suplemenata"),
  },
]

const trendChartConfig = {
  overall: { label: "Fitness Score", color: "var(--chart-1)" },
}

const radarChartConfig = {
  score: { label: "Score", color: "var(--chart-1)" },
}

function formatWeekLabel(dateString) {
  return new Date(`${dateString}T00:00:00Z`).toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
  })
}

function scoreColor(score) {
  if (score === null) return "text-muted-foreground"
  if (score >= 70) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 40) return "text-amber-600 dark:text-amber-400"
  return "text-rose-600 dark:text-rose-400"
}

export default function FitnessScore() {
  const [weeks, setWeeks] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getFitnessScoreHistoryRequest(WEEKS_TO_SHOW)
      .then(setWeeks)
      .catch((error) => {
        toast.error(error.response?.data?.message || "Neuspešno učitavanje score-a")
      })
      .finally(() => setIsLoading(false))
  }, [])

  const current = weeks.length > 0 ? weeks[weeks.length - 1] : null
  const trendData = weeks.map((week) => ({
    week: formatWeekLabel(week.weekStart),
    overall: week.overall,
  }))
  const radarData = current
    ? BREAKDOWN_ROWS.map((row) => ({
        category: row.label,
        score: current.breakdown[row.key].score ?? 0,
      }))
    : []

  return (
    <AppLayout breadcrumb="Fitness Score">
      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : !current ? (
        <EmptyState
          icon={Gauge}
          title="Nema podataka za prikaz"
          description="Probaj ponovo kasnije."
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Ova nedelja</CardTitle>
              <CardDescription>
                {current.weekStart} – {current.weekEnd}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 lg:flex-row lg:items-center">
              <div className="flex shrink-0 flex-col items-center justify-center lg:w-28">
                <span className={cn("text-5xl font-bold tabular-nums", scoreColor(current.overall))}>
                  {current.overall ?? "—"}
                </span>
                <span className="text-xs text-muted-foreground">od 100</span>
              </div>
              <ChartContainer
                config={radarChartConfig}
                className="mx-auto aspect-square max-h-64 w-full"
              >
                <RadarChart data={radarData}>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <PolarGrid />
                  <Radar
                    dataKey="score"
                    fill="var(--color-score)"
                    fillOpacity={0.6}
                    isAnimationActive
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                </RadarChart>
              </ChartContainer>
              <div className="flex flex-1 flex-col gap-2.5 lg:max-w-56">
                {BREAKDOWN_ROWS.map((row) => {
                  const item = current.breakdown[row.key]
                  const Icon = row.icon

                  return (
                    <div key={row.key} className="flex items-center gap-2.5 text-sm">
                      <Icon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="w-20 shrink-0">{row.label}</span>
                      <span className="text-xs text-muted-foreground">{row.describe(item)}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trend kroz vreme</CardTitle>
              <CardDescription>Poslednjih {weeks.length} nedelja</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={trendChartConfig} className="aspect-auto h-64 w-full">
                <LineChart accessibilityLayer data={trendData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="week" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={32} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    dataKey="overall"
                    type="monotone"
                    stroke="var(--color-overall)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-overall)" }}
                    connectNulls
                    isAnimationActive
                    animationDuration={1000}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </>
      )}
    </AppLayout>
  )
}
