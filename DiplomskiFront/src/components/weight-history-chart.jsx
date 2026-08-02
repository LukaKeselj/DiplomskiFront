import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useTranslation } from "react-i18next"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

function formatDay(dateString) {
  return new Date(`${dateString}T00:00:00Z`).toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
  })
}

export function WeightHistoryChart({ logs, className }) {
  const { t } = useTranslation()
  const chartConfig = {
    weight: { label: t("bodyWeight.chart.weightLabel"), color: "var(--chart-1)" },
  }
  const chartData = [...logs]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((log) => ({
      date: formatDay(log.date.slice(0, 10)),
      weight: log.weight,
    }))

  return (
    <ChartContainer config={chartConfig} className={className}>
      <LineChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
        <YAxis
          domain={["dataMin - 2", "dataMax + 2"]}
          tickLine={false}
          axisLine={false}
          width={36}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          dataKey="weight"
          type="monotone"
          stroke="var(--color-weight)"
          strokeWidth={2}
          dot={{ fill: "var(--color-weight)" }}
          isAnimationActive
          animationDuration={1000}
          animationEasing="ease-out"
        />
      </LineChart>
    </ChartContainer>
  )
}
