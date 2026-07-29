import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartConfig = {
  weight: { label: "Težina (kg)", color: "var(--chart-1)" },
}

function formatDay(dateString) {
  return new Date(`${dateString}T00:00:00Z`).toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
  })
}

export function WeightHistoryChart({ logs, className }) {
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
        />
      </LineChart>
    </ChartContainer>
  )
}
