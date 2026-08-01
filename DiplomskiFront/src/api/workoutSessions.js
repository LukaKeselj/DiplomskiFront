import { apiClient } from "@/api/client"

export async function getNextWorkoutDayRequest(workoutPlanId) {
  const { data } = await apiClient.get("/workout-sessions/next", {
    params: { workoutPlan: workoutPlanId },
  })
  return data
}

export async function getWorkoutSessionsRequest(workoutPlanId) {
  const { data } = await apiClient.get("/workout-sessions", {
    params: { workoutPlan: workoutPlanId },
  })
  return data
}

export async function completeWorkoutDayRequest(payload) {
  const { data } = await apiClient.post("/workout-sessions", payload)
  return data
}

export async function skipWorkoutDayRequest(payload) {
  const { data } = await apiClient.post("/workout-sessions/skip", payload)
  return data
}

export async function deleteWorkoutSessionRequest(id) {
  const { data } = await apiClient.delete(`/workout-sessions/${id}`)
  return data
}
