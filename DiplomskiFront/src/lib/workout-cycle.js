// Plan treninga se ne vezuje za stvarni dan u nedelji — ciklus kreće od dana
// aktivacije i vrti se u krug kroz 7 dana. Trening dani se ravnomerno
// raspoređuju kroz taj ciklus, a ostale pozicije su dani pauze.

const WEEK_LENGTH = 7

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getWorkoutCycleDayIndex(startDate, targetDate) {
  if (!startDate) return 0
  const diffDays = Math.round((startOfDay(targetDate) - startOfDay(startDate)) / (1000 * 60 * 60 * 24))
  return ((diffDays % WEEK_LENGTH) + WEEK_LENGTH) % WEEK_LENGTH
}

export function buildTrainingSlotMap(trainingDaysCount) {
  const slots = Array(WEEK_LENGTH).fill(null)
  for (let i = 0; i < trainingDaysCount; i++) {
    const slot = Math.floor((i * WEEK_LENGTH) / trainingDaysCount)
    slots[slot] = i
  }
  return slots
}

export function getWorkoutScheduleForDate(plan, startDate, targetDate) {
  if (!plan?.days?.length || !startDate) return { day: null, index: null, isRestDay: null }

  const cycleIndex = getWorkoutCycleDayIndex(startDate, targetDate)
  const slots = buildTrainingSlotMap(plan.days.length)
  const trainingIndex = slots[cycleIndex]

  if (trainingIndex === null) return { day: null, index: null, isRestDay: true }
  return { day: plan.days[trainingIndex], index: trainingIndex, isRestDay: false }
}

export function isBeforeActivation(startDate, date) {
  if (!startDate) return true
  return startOfDay(date) < startOfDay(startDate)
}
