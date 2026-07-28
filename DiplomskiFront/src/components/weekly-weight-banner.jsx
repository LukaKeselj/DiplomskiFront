import { useEffect, useState } from "react"
import { Link } from "react-router"
import toast from "react-hot-toast"
import { Scale } from "lucide-react"

import { getWeeklyWeightStatusRequest, logWeightRequest } from "@/api/weightLogs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function WeeklyWeightBanner() {
  const [status, setStatus] = useState(null)
  const [weight, setWeight] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    getWeeklyWeightStatusRequest()
      .then(setStatus)
      .catch(() => {})
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()

    const weightNumber = Number(weight)
    if (!(weightNumber > 0)) {
      toast.error("Unesi validnu težinu")
      return
    }

    setIsSubmitting(true)
    try {
      await logWeightRequest({ weight: weightNumber })
      toast.success("Težina je zabeležena")
      setWeight("")
      setStatus((prev) => ({ ...prev, hasLoggedThisWeek: true }))
    } catch (error) {
      toast.error(error.response?.data?.message || "Čuvanje nije uspelo")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!status || status.hasLoggedThisWeek) {
    return null
  }

  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <Scale className="size-5 shrink-0 text-primary" />
        <div className="flex flex-col">
          <span className="text-sm font-medium">Nisi unela/uneo težinu ove nedelje</span>
          <span className="text-xs text-muted-foreground">
            {status.currentWeight
              ? `Poslednje merenje: ${status.currentWeight} kg (${status.currentWeightDate})`
              : "Ovo bi bio tvoj prvi unos."}
          </span>
        </div>
      </div>
      <form className="flex items-center gap-2" onSubmit={handleSubmit}>
        <Input
          type="number"
          step="0.1"
          min="0"
          placeholder="kg"
          className="w-24"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
        />
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Čuvanje..." : "Sačuvaj"}
        </Button>
        <Button type="button" size="sm" variant="outline" asChild>
          <Link to="/body-weight">Istorija</Link>
        </Button>
      </form>
    </div>
  )
}
