import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import toast from "react-hot-toast"
import { ArrowLeft, Play } from "lucide-react"

import { getWorkoutPlanRequest } from "@/api/workoutPlans"
import { getExercisesRequest } from "@/api/exercises"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { getYoutubeEmbedUrl, getYoutubeThumbnailUrl } from "@/lib/youtube"

function DayExerciseCard({ order, item, exercise }) {
  const [isPlaying, setIsPlaying] = useState(false)
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
      </div>
    </div>
  )
}

export default function WorkoutPlanDayDetail() {
  const { id, dayId } = useParams()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [exercises, setExercises] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([getWorkoutPlanRequest(id), getExercisesRequest()])
      .then(([planData, exercisesData]) => {
        setPlan(planData)
        setExercises(exercisesData)
      })
      .catch((error) => {
        if (error.response?.status === 403) {
          toast.error("Nemaš pristup ovom planu")
        } else {
          toast.error(error.response?.data?.message || "Plan nije pronađen")
        }
        navigate("/workout-plans")
      })
      .finally(() => setIsLoading(false))
  }, [id, navigate])

  const exerciseById = useMemo(() => {
    const map = new Map()
    exercises.forEach((exercise) => map.set(exercise._id, exercise))
    return map
  }, [exercises])

  const day = plan?.days.find((d) => d._id === dayId)

  useEffect(() => {
    if (!isLoading && plan && !day) {
      toast.error("Dan nije pronađen")
      navigate(`/workout-plans/${id}`)
    }
  }, [isLoading, plan, day, id, navigate])

  return (
    <AppLayout breadcrumb={day?.dayName ?? "Dan"}>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Učitavanje...</p>
      ) : day ? (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <div>
            <Button variant="outline" asChild>
              <Link to={`/workout-plans/${id}`}>
                <ArrowLeft />
                Nazad na plan
              </Link>
            </Button>
          </div>
          <div>
            <h1 className="text-xl font-medium">{day.dayName}</h1>
            <p className="text-sm text-muted-foreground">
              {day.exercises.length} {day.exercises.length === 1 ? "vežba" : "vežbi"}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {day.exercises.map((item, index) => (
              <DayExerciseCard
                key={item._id}
                order={index + 1}
                item={item}
                exercise={exerciseById.get(item.exercise)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </AppLayout>
  )
}
