import axios from "axios"

const STORAGE_KEY = "auth"

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
})

apiClient.interceptors.request.use((config) => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    const { token } = JSON.parse(stored)
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
