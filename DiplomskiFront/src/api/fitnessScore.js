import { apiClient } from "@/api/client"

export async function getFitnessScoreHistoryRequest(weeks) {
  const { data } = await apiClient.get("/fitness-score", { params: weeks ? { weeks } : undefined })
  return data
}
