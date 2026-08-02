import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
import { Pencil, Trash2 } from "lucide-react"

import { deleteExerciseRequest, getExerciseRequest } from "@/api/exercises"
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
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/context/AuthContext"
import { ExerciseProgress } from "@/components/exercise-progress"
import { getYoutubeEmbedUrl } from "@/lib/youtube"

export default function ExerciseDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"
  const navigate = useNavigate()
  const [exercise, setExercise] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    getExerciseRequest(id)
      .then(setExercise)
      .catch((error) => {
        toast.error(error.response?.data?.message || t("exercises.detail.toasts.notFound"))
        navigate("/exercises")
      })
      .finally(() => setIsLoading(false))
  }, [id, navigate, t])

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteExerciseRequest(id)
      toast.success(t("exercises.detail.toasts.deleteSuccess"))
      navigate("/exercises")
    } catch (error) {
      toast.error(error.response?.data?.message || t("exercises.detail.toasts.deleteFailed"))
      setIsDeleting(false)
    }
  }

  const embedUrl = exercise ? getYoutubeEmbedUrl(exercise.videoUrl) : null

  return (
    <AppLayout breadcrumb={exercise?.name ?? t("exercises.detail.breadcrumbFallback")}>
      {isLoading ? (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="aspect-video w-full" />
            </CardContent>
          </Card>
        </div>
      ) : exercise ? (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{exercise.name}</CardTitle>
              <CardDescription className="capitalize">
                {exercise.muscleGroup}
                {exercise.equipment ? ` • ${exercise.equipment}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {embedUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-lg">
                  <iframe
                    src={embedUrl}
                    title={exercise.name}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              {exercise.description && (
                <p className="text-sm whitespace-pre-wrap">{exercise.description}</p>
              )}
            </CardContent>
          </Card>

          <ExerciseProgress exerciseId={exercise._id} />

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/exercises")}>
              {t("exercises.detail.backToList")}
            </Button>
            {isAdmin && (
              <>
                <Button variant="outline" asChild>
                  <Link to={`/exercises/${exercise._id}/edit`}>
                    <Pencil />
                    {t("exercises.detail.edit")}
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isDeleting}
                >
                  <Trash2 />
                  {isDeleting ? t("exercises.detail.deleting") : t("exercises.detail.delete")}
                </Button>
              </>
            )}
          </div>
        </div>
      ) : null}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("exercises.detail.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("exercises.detail.deleteDialog.description", { name: exercise?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("exercises.detail.deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              {t("exercises.detail.deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
