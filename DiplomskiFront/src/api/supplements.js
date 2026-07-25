import { apiClient } from "@/api/client"

export async function getSupplementsRequest() {
  const { data } = await apiClient.get("/supplements")
  return data
}

export async function getSupplementRequest(id) {
  const { data } = await apiClient.get(`/supplements/${id}`)
  return data
}

export async function createSupplementRequest(payload) {
  const { data } = await apiClient.post("/supplements", payload)
  return data
}

export async function updateSupplementRequest(id, payload) {
  const { data } = await apiClient.put(`/supplements/${id}`, payload)
  return data
}

export async function deleteSupplementRequest(id) {
  const { data } = await apiClient.delete(`/supplements/${id}`)
  return data
}

export async function getUserSupplementsRequest() {
  const { data } = await apiClient.get("/user-supplements")
  return data
}

export async function getUserSupplementRequest(id) {
  const { data } = await apiClient.get(`/user-supplements/${id}`)
  return data
}

export async function createUserSupplementRequest(payload) {
  const { data } = await apiClient.post("/user-supplements", payload)
  return data
}

export async function updateUserSupplementRequest(id, payload) {
  const { data } = await apiClient.put(`/user-supplements/${id}`, payload)
  return data
}

export async function deleteUserSupplementRequest(id) {
  const { data } = await apiClient.delete(`/user-supplements/${id}`)
  return data
}

export async function getSupplementLogsRequest(params) {
  const { data } = await apiClient.get("/supplement-logs", { params })
  return data
}

export async function logSupplementTakenRequest(payload) {
  const { data } = await apiClient.post("/supplement-logs", payload)
  return data
}

export async function deleteSupplementLogRequest(id) {
  const { data } = await apiClient.delete(`/supplement-logs/${id}`)
  return data
}
