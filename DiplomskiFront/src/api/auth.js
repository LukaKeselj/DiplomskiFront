import { apiClient } from "@/api/client"

export async function loginRequest(email, password) {
  const { data } = await apiClient.post("/auth/login", { email, password })
  return data
}

export async function registerRequest(payload) {
  const { data } = await apiClient.post("/auth/register", payload)
  return data
}

export async function googleAuthRequest(credential) {
  const { data } = await apiClient.post("/auth/google", { credential })
  return data
}

export async function completeGoogleRegistrationRequest(pendingToken, { username, height }) {
  const { data } = await apiClient.post("/auth/google/complete", {
    pendingToken,
    username,
    height,
  })
  return data
}
