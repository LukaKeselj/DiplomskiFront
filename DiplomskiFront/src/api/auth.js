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

export async function forgotPasswordRequest(email) {
  const { data } = await apiClient.post("/auth/forgot-password", { email })
  return data
}

export async function resetPasswordRequest(token, password) {
  const { data } = await apiClient.post("/auth/reset-password", { token, password })
  return data
}

export async function logoutRequest() {
  const { data } = await apiClient.post("/auth/logout")
  return data
}

export async function meRequest() {
  const { data } = await apiClient.get("/auth/me")
  return data
}

export async function refreshRequest() {
  const { data } = await apiClient.post("/auth/refresh")
  return data
}
