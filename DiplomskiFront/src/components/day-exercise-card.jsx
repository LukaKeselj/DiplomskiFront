import { useEffect, useState } from "react"
import { Link } from "react-router"
import toast from "react-hot-toast"
import { Check, Dumbbell, Play } from "lucide-react"

import { getWorkoutLogsRequest, logWorkoutWeightRequest } from "@/api/workoutLogs"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { getYoutubeEmbedUrl, getYoutubeThumbnailUrl } from "@/lib/youtube"

function todayDateString() {
  return new Date().toISOString().slice(0, 10)
}

export function DayExerciseCard({
  order,
  item,
  exercise,
  date,
  readOnly = false,
  loggedWeight = null,
  onWeightSaved,
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [weight, setWeight] = useState(loggedWeight != null ? String(loggedWeight) : "")
  const [isSaving, setIsSaving] = useState(false)
  const [syncedLoggedWeight, setSyncedLoggedWeight] = useState(loggedWeight)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [recentLogs, setRecentLogs] = useState(null)
  const thumbnailUrl = exercise?.videoUrl ? getYoutubeThumbnailUrl(exercise.videoUrl) : null
  const embedUrl = exercise?.videoUrl ? getYoutubeEmbedUrl(exercise.videoUrl) : null

  if (loggedWeight !== syncedLoggedWeight) {
    setSyncedLoggedWeight(loggedWeight)
    setWeight(loggedWeight != null ? String(loggedWeight) : "")
  }

  useEffect(() => {
    if (!isDetailOpen || !exercise?._id) return
    getWorkoutLogsRequest({ exercise: exercise._id })
      .then((logs) => setRecentLogs(logs.slice(0, 5)))
      .catch(() => setRecentLogs([]))
  }, [isDetailOpen, exercise?._id])

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
        date: date ?? todayDateString(),
        weight: weightNumber,
      })
      toast.success(`Kilaža zabeležena za ${exercise?.name ?? "vežbu"}`)
      onWeightSaved?.(weightNumber)
    } catch (error) {
      toast.error(error.response?.data?.message || "Čuvanje nije uspelo")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsDetailOpen(true)}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return
          event.preventDefault()
          setIsDetailOpen(true)
        }}
        className="flex h-full cursor-pointer flex-col gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {typeof order === "number" && (
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
                {order}
              </span>
            )}
            <div>
              <p className="text-sm font-medium">{exercise?.name ?? "Nepoznata vežba"}</p>
              {exercise?.muscleGroup && (
                <p className="text-xs text-muted-foreground capitalize">{exercise.muscleGroup}</p>
              )}
            </div>
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
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
          {!thumbnailUrl ? (
            <div className="flex h-full w-full items-center justify-center">
              <Dumbbell className="size-6 text-muted-foreground" />
            </div>
          ) : isPlaying && embedUrl ? (
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
        {readOnly ? (
          exercise && (
            <div className="mt-auto flex items-center">
              <Link
                to={`/exercises/${exercise._id}`}
                onClick={(event) => event.stopPropagation()}
                className="text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                Istorija
              </Link>
            </div>
          )
        ) : (
          <div
            className="mt-auto flex flex-col gap-1.5"
            onClick={(event) => event.stopPropagation()}
          >
            {loggedWeight != null && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <Check className="size-3.5" />
                Zabeleženo: {loggedWeight} kg
              </span>
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
                {isSaving
                  ? "Čuvanje..."
                  : loggedWeight != null
                    ? "Ažuriraj kilažu"
                    : "Zabeleži kilažu"}
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
        )}
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{exercise?.name ?? "Nepoznata vežba"}</DialogTitle>
            <DialogDescription className="capitalize">
              {[exercise?.muscleGroup, exercise?.equipment].filter(Boolean).join(" • ")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {embedUrl && (
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                <iframe
                  src={embedUrl}
                  title={exercise.name}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {exercise?.description && (
              <p className="text-sm text-muted-foreground">{exercise.description}</p>
            )}

            <div className="grid grid-cols-3 gap-4 rounded-lg border border-border p-3 text-center">
              <div>
                <p className="text-lg font-semibold">{item.targetSets}</p>
                <p className="text-xs text-muted-foreground">Serije</p>
              </div>
              <div>
                <p className="text-lg font-semibold">{item.targetReps}</p>
                <p className="text-xs text-muted-foreground">Ponavljanja</p>
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {typeof item.restMinutes === "number" ? item.restMinutes : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Odmor (min)</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Nedavni napredak</p>
              {recentLogs === null ? (
                <p className="text-sm text-muted-foreground">Učitavanje...</p>
              ) : recentLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Još nema zabeleženih kilaža za ovu vežbu.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {recentLogs.map((log) => (
                    <div
                      key={log._id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">{log.date.slice(0, 10)}</span>
                      <span className="font-medium">{log.weight} kg</span>
                    </div>
                  ))}
                </div>
              )}
              {exercise && (
                <Link
                  to={`/exercises/${exercise._id}`}
                  className="mt-2 inline-block text-xs text-muted-foreground underline-offset-4 hover:underline"
                >
                  Kompletna istorija
                </Link>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
