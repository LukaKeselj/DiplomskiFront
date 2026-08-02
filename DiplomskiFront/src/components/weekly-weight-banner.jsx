import { useEffect, useState } from "react"
import { Link } from "react-router"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
import { Scale } from "lucide-react"

import { getWeeklyWeightStatusRequest, logWeightRequest } from "@/api/weightLogs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function WeeklyWeightBanner({ onWeightLogged }) {
  const { t } = useTranslation()
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
      toast.error(t("home.weeklyWeightBanner.toasts.invalidWeight"))
      return
    }

    setIsSubmitting(true)
    try {
      await logWeightRequest({ weight: weightNumber })
      toast.success(t("home.weeklyWeightBanner.toasts.saved"))
      setWeight("")
      setStatus((prev) => ({ ...prev, hasLoggedThisWeek: true }))
      onWeightLogged?.()
    } catch (error) {
      toast.error(error.response?.data?.message || t("home.weeklyWeightBanner.toasts.saveError"))
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
          <span className="text-sm font-medium">{t("home.weeklyWeightBanner.message")}</span>
          <span className="text-xs text-muted-foreground">
            {status.currentWeight
              ? t("home.weeklyWeightBanner.lastMeasurement", {
                  weight: status.currentWeight,
                  date: status.currentWeightDate,
                })
              : t("home.weeklyWeightBanner.firstEntry")}
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
          {isSubmitting ? t("home.weeklyWeightBanner.saving") : t("home.weeklyWeightBanner.save")}
        </Button>
        <Button type="button" size="sm" variant="outline" asChild>
          <Link to="/body-weight">{t("home.weeklyWeightBanner.history")}</Link>
        </Button>
      </form>
    </div>
  )
}
