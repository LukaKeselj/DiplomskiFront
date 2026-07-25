import axios from "axios"
import { AUTH_STORAGE_KEY } from "@/lib/authStorage"

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  withCredentials: true,
})

let isRefreshing = false
let pendingQueue = []

function resolvePendingQueue(error) {
  pendingQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()))
  pendingQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error
    const isAuthEndpoint = ["/auth/login", "/auth/register", "/auth/refresh"].some((path) =>
      config?.url?.startsWith(path)
    )

    if (response?.status !== 401 || config?._retry || isAuthEndpoint) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject })
      }).then(() => apiClient(config))
    }

    config._retry = true
    isRefreshing = true

    try {
      await apiClient.post("/auth/refresh")
      resolvePendingQueue(null)
      return apiClient(config)
    } catch (refreshError) {
      resolvePendingQueue(refreshError)
      localStorage.removeItem(AUTH_STORAGE_KEY)
      window.location.href = "/login"
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)
