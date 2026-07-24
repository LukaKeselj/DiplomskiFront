import { apiClient } from "@/api/client"

export async function getExercisesRequest() {
  const { data } = await apiClient.get("/exercises")
  return data
}

export async function getExerciseRequest(id) {
  const { data } = await apiClient.get(`/exercises/${id}`)
  return data
}

export async function createExerciseRequest(payload) {
  const { data } = await apiClient.post("/exercises", payload)
  return data
}

export async function updateExerciseRequest(id, payload) {
  const { data } = await apiClient.put(`/exercises/${id}`, payload)
  return data
}

export async function deleteExerciseRequest(id) {
  const { data } = await apiClient.delete(`/exercises/${id}`)
  return data
}
