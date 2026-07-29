import { useState } from "react"
import { Link } from "react-router"
import toast from "react-hot-toast"
import { Play } from "lucide-react"

import { logWorkoutWeightRequest } from "@/api/workoutLogs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getYoutubeEmbedUrl, getYoutubeThumbnailUrl } from "@/lib/youtube"

function todayDateString() {
  return new Date().toISOString().slice(0, 10)
}

export function DayExerciseCard({ order, item, exercise }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [weight, setWeight] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const thumbnailUrl = exercise?.videoUrl ? getYoutubeThumbnailUrl(exercise.videoUrl) : null
  const embedUrl = exercise?.videoUrl ? getYoutubeEmbedUrl(exercise.videoUrl) : null

  function handlePlayClick(event) {
    event.preventDefault()
    event.stopPropagation()
    setIsPlaying(true)
  }

  function handlePlayKeyDown(event) {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    event.stopPropagation()
    setIsPlaying(true)
  }

  async function handleSaveWeight() {
    const weightNumber = Number(weight)
    if (!(weightNumber > 0)) {
      toast.error("Unesi validnu kilažu")
      return
    }

    setIsSaving(true)
    try {
      await logWorkoutWeightRequest({
        exercise: item.exercise,
        date: todayDateString(),
        weight: weightNumber,
      })
      toast.success(`Kilaža zabeležena za ${exercise?.name ?? "vežbu"}`)
      setWeight("")
    } catch (error) {
      toast.error(error.response?.data?.message || "Čuvanje nije uspelo")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
        {order}
      </div>
      <div className="flex flex-1 flex-col gap-3 rounded-lg border p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{exercise?.name ?? "Nepoznata vežba"}</p>
            {exercise?.muscleGroup && (
              <p className="text-xs text-muted-foreground capitalize">{exercise.muscleGroup}</p>
            )}
          </div>
          <div className="text-right">
            <span className="text-sm text-muted-foreground">
              {item.targetSets} x {item.targetReps}
            </span>
            {typeof item.restMinutes === "number" && (
              <p className="text-xs text-muted-foreground">Odmor: {item.restMinutes} min</p>
            )}
          </div>
        </div>
        {thumbnailUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
            {isPlaying && embedUrl ? (
              <iframe
                src={`${embedUrl}?autoplay=1`}
                title={exercise.name}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div
                role="button"
                tabIndex={0}
                aria-label={`Pusti video: ${exercise.name}`}
                onClick={handlePlayClick}
                onKeyDown={handlePlayKeyDown}
                className="absolute inset-0 h-full w-full cursor-pointer"
              >
                <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30">
                  <div className="flex size-9 items-center justify-center rounded-full bg-black/60">
                    <Play className="size-4 fill-white text-white" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            step="0.5"
            min="0"
            placeholder="kg"
            className="w-24"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleSaveWeight}
            disabled={isSaving}
          >
            {isSaving ? "Čuvanje..." : "Zabeleži kilažu"}
          </Button>
          {exercise && (
            <Link
              to={`/exercises/${exercise._id}`}
              className="ml-auto text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              Istorija
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
