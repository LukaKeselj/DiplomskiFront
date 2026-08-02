import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
import { Activity, Pencil, Play, Plus, Search, Trash2 } from "lucide-react"

import { deleteExerciseRequest, getExercisesRequest } from "@/api/exercises"
import { AppLayout } from "@/components/app-layout"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CardGrid, CardGridItem } from "@/components/ui/card-grid"
import { CardGridSkeleton } from "@/components/ui/card-grid-skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/context/AuthContext"
import { MUSCLE_GROUPS } from "@/lib/muscle-groups"
import { getYoutubeEmbedUrl, getYoutubeThumbnailUrl } from "@/lib/youtube"

function ExerciseCard({ exercise, isAdmin, onDeleteRequest }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
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

  function handleEditClick(event) {
    event.preventDefault()
    event.stopPropagation()
    navigate(`/exercises/${exercise._id}/edit`)
  }

  function handleDeleteClick(event) {
    event.preventDefault()
    event.stopPropagation()
    onDeleteRequest(exercise)
  }

  return (
    <Link to={`/exercises/${exercise._id}`}>
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardTitle>{exercise.name}</CardTitle>
          <CardDescription className="capitalize">{exercise.muscleGroup}</CardDescription>
          {isAdmin && (
            <CardAction className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleEditClick}>
                <Pencil />
              </Button>
              <Button variant="destructive" size="icon" onClick={handleDeleteClick}>
                <Trash2 />
              </Button>
            </CardAction>
          )}
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
                    aria-label={t("exercises.list.playVideoAria", { name: exercise.name })}
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
  const { t } = useTranslation()
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"
  const [exercises, setExercises] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [muscleGroupFilter, setMuscleGroupFilter] = useState("all")
  const [query, setQuery] = useState("")
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    getExercisesRequest()
      .then(setExercises)
      .catch((error) => {
        toast.error(error.response?.data?.message || t("exercises.list.toasts.loadFailed"))
      })
      .finally(() => setIsLoading(false))
  }, [t])

  async function handleDelete() {
    if (!deleteTarget) return

    setIsDeleting(true)
    try {
      await deleteExerciseRequest(deleteTarget._id)
      setExercises((prev) => prev.filter((item) => item._id !== deleteTarget._id))
      toast.success(t("exercises.list.toasts.deleteSuccess"))
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error.response?.data?.message || t("exercises.list.toasts.deleteFailed"))
    } finally {
      setIsDeleting(false)
    }
  }

  const trimmedQuery = query.trim().toLowerCase()
  const visibleExercises = exercises.filter((exercise) => {
    const matchesGroup = muscleGroupFilter === "all" || exercise.muscleGroup === muscleGroupFilter
    const matchesQuery = !trimmedQuery || exercise.name.toLowerCase().includes(trimmedQuery)
    return matchesGroup && matchesQuery
  })

  return (
    <AppLayout breadcrumb={t("exercises.list.breadcrumb")}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="w-56 pl-8"
              placeholder={t("exercises.list.searchPlaceholder")}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Select value={muscleGroupFilter} onValueChange={setMuscleGroupFilter}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("exercises.list.allMuscleGroups")}</SelectItem>
              {MUSCLE_GROUPS.map((group) => (
                <SelectItem key={group.value} value={group.value}>
                  {t(group.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link to="/exercises/new">
              <Plus />
              {t("exercises.list.addExercise")}
            </Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <CardGridSkeleton />
      ) : visibleExercises.length === 0 ? (
        <EmptyState
          icon={Activity}
          title={t("exercises.list.empty.title")}
          description={
            isAdmin
              ? t("exercises.list.empty.descriptionAdmin")
              : t("exercises.list.empty.descriptionUser")
          }
          action={
            isAdmin && (
              <Button asChild size="sm">
                <Link to="/exercises/new">
                  <Plus />
                  {t("exercises.list.addExercise")}
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <CardGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleExercises.map((exercise) => (
            <CardGridItem key={exercise._id}>
              <ExerciseCard
                exercise={exercise}
                isAdmin={isAdmin}
                onDeleteRequest={setDeleteTarget}
              />
            </CardGridItem>
          ))}
        </CardGrid>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("exercises.list.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("exercises.list.deleteDialog.description", { name: deleteTarget?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("exercises.list.deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? t("exercises.list.deleteDialog.confirming") : t("exercises.list.deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
