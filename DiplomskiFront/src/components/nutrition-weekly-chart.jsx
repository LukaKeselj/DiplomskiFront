import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { getSummaryRangeRequest } from "@/api/nutrition"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

function getChartConfig(t) {
  return {
    protein: { label: t("nutrition.weeklyChart.protein"), color: "var(--chart-1)" },
    fat: { label: t("nutrition.weeklyChart.fat"), color: "var(--chart-2)" },
    carbs: { label: t("nutrition.weeklyChart.carbs"), color: "var(--chart-3)" },
  }
}

function formatMacroTooltip(chartConfig) {
  return (_value, _name, item) => {
    const grams = item.payload?.[`${item.dataKey}Grams`]
    const config = chartConfig[item.dataKey]

    return (
      <div className="flex w-full items-center gap-2">
        <div
          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
          style={{ backgroundColor: config?.color }}
        />
        <div className="flex flex-1 items-center justify-between leading-none">
          <span className="text-muted-foreground">{config?.label}</span>
          <span className="font-mono font-medium text-foreground tabular-nums">{grams}g</span>
        </div>
      </div>
    )
  }
}

function round(value) {
  return Math.round(value * 10) / 10
}

function toDateString(date) {
  return date.toISOString().slice(0, 10)
}

function sixDaysBefore(endDate) {
  const start = new Date(`${endDate}T00:00:00Z`)
  start.setUTCDate(start.getUTCDate() - 6)
  return toDateString(start)
}

export function NutritionWeeklyChart({ endDate }) {
  const { t } = useTranslation()
  const dayLabels = t("nutrition.weeklyChart.days", { returnObjects: true })
  const chartConfig = getChartConfig(t)
  const [isLoading, setIsLoading] = useState(true)
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    getSummaryRangeRequest(sixDaysBefore(endDate), endDate)
      .then((summaries) => {
        setChartData(
          summaries.map((summary) => ({
            day: dayLabels[new Date(`${summary.date}T00:00:00Z`).getUTCDay()],
            protein: round(summary.protein * 4),
            proteinGrams: round(summary.protein),
            fat: round(summary.fat * 9),
            fatGrams: round(summary.fat),
            carbs: round(summary.carbs * 4),
            carbsGrams: round(summary.carbs),
            calories: round(summary.calories),
          }))
        )
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || t("nutrition.weeklyChart.loadError"))
      })
      .finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endDate])

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />
  }

  return (
    <ChartContainer config={chartConfig}>
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent formatter={formatMacroTooltip(chartConfig)} />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="protein" stackId="a" fill="var(--color-protein)" radius={[0, 0, 4, 4]} />
        <Bar dataKey="fat" stackId="a" fill="var(--color-fat)" />
        <Bar dataKey="carbs" stackId="a" fill="var(--color-carbs)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
