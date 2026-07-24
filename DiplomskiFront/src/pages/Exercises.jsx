import { useEffect, useState } from "react"
import { Link } from "react-router"
import toast from "react-hot-toast"
import { Play, Plus } from "lucide-react"

import { getExercisesRequest } from "@/api/exercises"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { useAuth } from "@/context/AuthContext"
import { MUSCLE_GROUPS } from "@/lib/muscle-groups"
import { getYoutubeEmbedUrl, getYoutubeThumbnailUrl } from "@/lib/youtube"

function ExerciseCard({ exercise }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const thumbnailUrl = getYoutubeThumbnailUrl(exercise.videoUrl)
  const embedUrl = getYoutubeEmbedUrl(exercise.videoUrl)

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
    <Link to={`/exercises/${exercise._id}`}>
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardTitle>{exercise.name}</CardTitle>
          <CardDescription className="capitalize">{exercise.muscleGroup}</CardDescription>
        </CardHeader>
        {(thumbnailUrl || exercise.equipment) && (
          <CardContent className="flex flex-col gap-3">
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
            {exercise.equipment && (
              <span className="text-sm text-muted-foreground">{exercise.equipment}</span>
            )}
          </CardContent>
        )}
      </Card>
    </Link>
  )
}

export default function Exercises() {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"
  const [exercises, setExercises] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [muscleGroupFilter, setMuscleGroupFilter] = useState("all")

  useEffect(() => {
    getExercisesRequest()
      .then(setExercises)
      .catch((error) => {
        toast.error(error.response?.data?.message || "Neuspešno učitavanje vežbi")
      })
      .finally(() => setIsLoading(false))
  }, [])

  const visibleExercises =
    muscleGroupFilter === "all"
      ? exercises
      : exercises.filter((exercise) => exercise.muscleGroup === muscleGroupFilter)

  return (
    <AppLayout breadcrumb="Vežbe">
      <div className="flex items-center justify-between gap-4">
        <Select
          className="w-56"
          value={muscleGroupFilter}
          onChange={(event) => setMuscleGroupFilter(event.target.value)}
        >
          <option value="all">Sve mišićne grupe</option>
          {MUSCLE_GROUPS.map((group) => (
            <option key={group.value} value={group.value}>
              {group.label}
            </option>
          ))}
        </Select>
        {isAdmin && (
          <Button asChild>
            <Link to="/exercises/new">
              <Plus />
              Dodaj vežbu
            </Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Učitavanje vežbi...</p>
      ) : visibleExercises.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nema vežbi za prikaz</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleExercises.map((exercise) => (
            <ExerciseCard key={exercise._id} exercise={exercise} />
          ))}
        </div>
      )}
    </AppLayout>
  )
}
