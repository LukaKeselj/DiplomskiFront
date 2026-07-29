import { apiClient } from "@/api/client"

export async function getNutritionPlansRequest() {
  const { data } = await apiClient.get("/nutrition-plans")
  return data
}

export async function getNutritionPlanRequest(id) {
  const { data } = await apiClient.get(`/nutrition-plans/${id}`)
  return data
}

export async function createNutritionPlanRequest(payload) {
  const { data } = await apiClient.post("/nutrition-plans", payload)
  return data
}

export async function updateNutritionPlanRequest(id, payload) {
  const { data } = await apiClient.put(`/nutrition-plans/${id}`, payload)
  return data
}

export async function deleteNutritionPlanRequest(id) {
  const { data } = await apiClient.delete(`/nutrition-plans/${id}`)
  return data
}

export async function getActiveNutritionPlanRequest() {
  const { data } = await apiClient.get("/nutrition-plans/active")
  return data
}

export async function activateNutritionPlanRequest(id) {
  const { data } = await apiClient.post(`/nutrition-plans/${id}/activate`)
  return data
}

export async function confirmNutritionPlanItemRequest(planId, payload) {
  const { data } = await apiClient.post(`/nutrition-plans/${planId}/confirm-item`, payload)
  return data
}
