import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import toast from "react-hot-toast"
import { ArrowLeft, Check, Play } from "lucide-react"

import { getWorkoutPlanRequest } from "@/api/workoutPlans"
import { getExercisesRequest } from "@/api/exercises"
import { logWorkoutWeightRequest } from "@/api/workoutLogs"
import { completeWorkoutDayRequest, getNextWorkoutDayRequest } from "@/api/workoutSessions"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getYoutubeEmbedUrl, getYoutubeThumbnailUrl } from "@/lib/youtube"

function todayDateString() {
  return new Date().toISOString().slice(0, 10)
}

function DayExerciseCard({ order, item, exercise }) {
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
          <Button type="button" size="sm" variant="outline" onClick={handleSaveWeight} disabled={isSaving}>
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

export default function WorkoutPlanDayDetail() {
  const { id, dayId } = useParams()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [exercises, setExercises] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [nextDay, setNextDay] = useState(null)
  const [isCompleting, setIsCompleting] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)

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

  useEffect(() => {
    getNextWorkoutDayRequest(id)
      .then(setNextDay)
      .catch(() => {})
  }, [id, justCompleted])

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

  const isNextDay = nextDay?.day?._id === dayId

  async function handleCompleteDay() {
    setIsCompleting(true)
    try {
      await completeWorkoutDayRequest({ workoutPlan: id, day: dayId, date: todayDateString() })
      toast.success("Dan je označen kao odrađen")
      setJustCompleted(true)
    } catch (error) {
      toast.error(error.response?.data?.message || "Nije uspelo označavanje dana")
    } finally {
      setIsCompleting(false)
    }
  }

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
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-medium">{day.dayName}</h1>
              <p className="text-sm text-muted-foreground">
                {day.exercises.length} {day.exercises.length === 1 ? "vežba" : "vežbi"}
              </p>
            </div>
            {justCompleted ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <Check className="size-4" />
                Odrađeno danas
              </span>
            ) : isNextDay ? (
              <Button onClick={handleCompleteDay} disabled={isCompleting}>
                <Check />
                {isCompleting ? "Čuvanje..." : "Završi dan"}
              </Button>
            ) : nextDay?.day ? (
              <span className="text-sm text-muted-foreground">
                Sledeći na redu:{" "}
                <Link className="underline underline-offset-4" to={`/workout-plans/${id}/days/${nextDay.day._id}`}>
                  {nextDay.day.dayName}
                </Link>
              </span>
            ) : null}
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
