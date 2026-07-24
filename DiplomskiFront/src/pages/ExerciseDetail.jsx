import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import toast from "react-hot-toast"
import { Pencil, Trash2 } from "lucide-react"

import { deleteExerciseRequest, getExerciseRequest } from "@/api/exercises"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"
import { getYoutubeEmbedUrl } from "@/lib/youtube"

export default function ExerciseDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"
  const navigate = useNavigate()
  const [exercise, setExercise] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    getExerciseRequest(id)
      .then(setExercise)
      .catch((error) => {
        toast.error(error.response?.data?.message || "Vežba nije pronađena")
        navigate("/exercises")
      })
      .finally(() => setIsLoading(false))
  }, [id, navigate])

  async function handleDelete() {
    if (!window.confirm(`Obrisati vežbu "${exercise.name}"?`)) return

    setIsDeleting(true)
    try {
      await deleteExerciseRequest(id)
      toast.success("Vežba je obrisana")
      navigate("/exercises")
    } catch (error) {
      toast.error(error.response?.data?.message || "Brisanje vežbe nije uspelo")
      setIsDeleting(false)
    }
  }

  const embedUrl = exercise ? getYoutubeEmbedUrl(exercise.videoUrl) : null

  return (
    <AppLayout breadcrumb={exercise?.name ?? "Vežba"}>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Učitavanje...</p>
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/exercises")}>
              Nazad na listu
            </Button>
            {isAdmin && (
              <>
                <Button variant="outline" asChild>
                  <Link to={`/exercises/${exercise._id}/edit`}>
                    <Pencil />
                    Izmeni
                  </Link>
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  <Trash2 />
                  {isDeleting ? "Brisanje..." : "Obriši"}
                </Button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </AppLayout>
  )
}
