import { apiClient } from "@/api/client"

export async function getWorkoutLogsRequest(params) {
  const { data } = await apiClient.get("/workout-logs", { params })
  return data
}

export async function logWorkoutWeightRequest(payload) {
  const { data } = await apiClient.post("/workout-logs", payload)
  return data
}

export async function deleteWorkoutLogRequest(id) {
  const { data } = await apiClient.delete(`/workout-logs/${id}`)
  return data
}
