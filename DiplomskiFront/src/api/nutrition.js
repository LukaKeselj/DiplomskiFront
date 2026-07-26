import { apiClient } from "@/api/client"

export async function searchFoodRequest(query) {
  const { data } = await apiClient.get("/foods/search", { params: { q: query } })
  return data
}

export async function getFoodDetailsRequest(foodId) {
  const { data } = await apiClient.get(`/foods/${foodId}`)
  return data
}

export async function getNutritionLogsRequest(date) {
  const { data } = await apiClient.get("/nutrition-logs", { params: date ? { date } : undefined })
  return data
}

export async function getDailySummaryRequest(date) {
  const { data } = await apiClient.get("/nutrition-logs/summary", { params: { date } })
  return data
}

export async function createNutritionLogRequest(payload) {
  const { data } = await apiClient.post("/nutrition-logs", payload)
  return data
}

export async function updateNutritionLogRequest(id, payload) {
  const { data } = await apiClient.put(`/nutrition-logs/${id}`, payload)
  return data
}

export async function deleteNutritionLogRequest(id) {
  const { data } = await apiClient.delete(`/nutrition-logs/${id}`)
  return data
}
