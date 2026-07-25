import { useEffect, useState } from "react"
import { Link } from "react-router"
import toast from "react-hot-toast"
import { Pencil, Plus, Trash2 } from "lucide-react"

import { deleteSupplementRequest, getSupplementsRequest } from "@/api/supplements"
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
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"

function SupplementCard({ supplement, isAdmin, onDeleteRequest }) {
  return (
    <Card className="h-full transition-colors hover:bg-muted/50">
      <CardHeader>
        <CardTitle>{supplement.name}</CardTitle>
        {isAdmin && (
          <CardAction className="flex gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link to={`/supplements/${supplement._id}/edit`}>
                <Pencil />
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onDeleteRequest(supplement)}
            >
              <Trash2 />
            </Button>
          </CardAction>
        )}
      </CardHeader>
      {(supplement.imageUrl || !isAdmin) && (
        <CardContent className="flex flex-col gap-3">
          {supplement.imageUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
              <img
                src={supplement.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          )}
          {!isAdmin && (
            <Button variant="outline" asChild>
              <Link to={`/my-supplements/new?supplementId=${supplement._id}`}>
                <Plus />
                Dodaj u moj režim
              </Link>
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default function Supplements() {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"
  const [supplements, setSupplements] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    getSupplementsRequest()
      .then(setSupplements)
      .catch((error) => {
        toast.error(error.response?.data?.message || "Neuspešno učitavanje suplemenata")
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function handleDelete() {
    if (!deleteTarget) return

    setIsDeleting(true)
    try {
      await deleteSupplementRequest(deleteTarget._id)
      setSupplements((prev) => prev.filter((item) => item._id !== deleteTarget._id))
      toast.success("Suplement je obrisan")
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error.response?.data?.message || "Brisanje suplementa nije uspelo")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AppLayout breadcrumb="Suplementi">
      <div className="flex justify-end">
        {isAdmin && (
          <Button asChild>
            <Link to="/supplements/new">
              <Plus />
              Dodaj suplement
            </Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Učitavanje suplemenata...</p>
      ) : supplements.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nema suplemenata za prikaz</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {supplements.map((supplement) => (
            <SupplementCard
              key={supplement._id}
              supplement={supplement}
              isAdmin={isAdmin}
              onDeleteRequest={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati suplement?</AlertDialogTitle>
            <AlertDialogDescription>
              Da li si siguran da želiš da obrišeš suplement &quot;{deleteTarget?.name}&quot;? Ova
              akcija se ne može poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Otkaži</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Brisanje..." : "Obriši"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
