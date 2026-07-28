import { apiClient } from "@/api/client"

export async function getWorkoutPlansRequest() {
  const { data } = await apiClient.get("/workout-plans")
  return data
}

export async function getWorkoutPlanRequest(id) {
  const { data } = await apiClient.get(`/workout-plans/${id}`)
  return data
}

export async function createWorkoutPlanRequest(payload) {
  const { data } = await apiClient.post("/workout-plans", payload)
  return data
}

export async function updateWorkoutPlanRequest(id, payload) {
  const { data } = await apiClient.put(`/workout-plans/${id}`, payload)
  return data
}

export async function deleteWorkoutPlanRequest(id) {
  const { data } = await apiClient.delete(`/workout-plans/${id}`)
  return data
}

export async function getActiveWorkoutPlanRequest() {
  const { data } = await apiClient.get("/workout-plans/active")
  return data
}

export async function activateWorkoutPlanRequest(id) {
  const { data } = await apiClient.post(`/workout-plans/${id}/activate`)
  return data
}
