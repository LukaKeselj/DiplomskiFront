import { apiClient } from "@/api/client"

export async function getAllUsersRequest() {
  const { data } = await apiClient.get("/users")
  return data
}

export async function setUserBlockedStatusRequest(id, isBlocked) {
  const { data } = await apiClient.patch(`/users/${id}/block`, { isBlocked })
  return data
}
