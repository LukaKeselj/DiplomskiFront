// Plan ishrane se ne vezuje za stvarni dan u nedelji — ciklus kreće od dana
// aktivacije (taj dan je plan.days[0]) i vrti se u krug na osnovu broja dana u planu.

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getNutritionCycleDayIndex(startDate, targetDate, dayCount) {
  if (!startDate || !dayCount) return 0
  const diffDays = Math.round((startOfDay(targetDate) - startOfDay(startDate)) / (1000 * 60 * 60 * 24))
  return ((diffDays % dayCount) + dayCount) % dayCount
}

export function getNutritionPlanDayForDate(plan, startDate, date) {
  if (!plan?.days?.length || !startDate) return null
  return plan.days[getNutritionCycleDayIndex(startDate, date, plan.days.length)]
}

export function isBeforeActivation(startDate, date) {
  if (!startDate) return true
  return startOfDay(date) < startOfDay(startDate)
}
