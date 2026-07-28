import { apiClient } from "@/api/client"

export async function getWeightLogsRequest(date) {
  const { data } = await apiClient.get("/weight-logs", { params: date ? { date } : undefined })
  return data
}

export async function getWeeklyWeightStatusRequest() {
  const { data } = await apiClient.get("/weight-logs/status")
  return data
}

export async function logWeightRequest(payload) {
  const { data } = await apiClient.post("/weight-logs", payload)
  return data
}

export async function deleteWeightLogRequest(id) {
  const { data } = await apiClient.delete(`/weight-logs/${id}`)
  return data
}
