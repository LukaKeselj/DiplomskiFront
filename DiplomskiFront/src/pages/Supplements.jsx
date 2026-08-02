import { useEffect, useState } from "react"
import { Link } from "react-router"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
import { Pencil, Pill, Plus, Search, Trash2 } from "lucide-react"

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
import { useAuth } from "@/context/AuthContext"

function SupplementCard({ supplement, isAdmin, onDeleteRequest }) {
  const { t } = useTranslation()
  return (
    <Card className="h-full transition-colors hover:bg-muted/50">
      <CardHeader>
        <CardTitle>{supplement.name}</CardTitle>
        {supplement.description && (
          <CardDescription className="line-clamp-2">{supplement.description}</CardDescription>
        )}
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
                className="h-full w-full object-contain"
              />
            </div>
          )}
          {!isAdmin && (
            <Button variant="outline" asChild>
              <Link to={`/my-supplements/new?supplementId=${supplement._id}`}>
                <Plus />
                {t("supplements.list.addToMyRoutine")}
              </Link>
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default function Supplements() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"
  const [supplements, setSupplements] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    getSupplementsRequest()
      .then(setSupplements)
      .catch((error) => {
        toast.error(error.response?.data?.message || t("supplements.list.loadError"))
      })
      .finally(() => setIsLoading(false))
  }, [t])

  async function handleDelete() {
    if (!deleteTarget) return

    setIsDeleting(true)
    try {
      await deleteSupplementRequest(deleteTarget._id)
      setSupplements((prev) => prev.filter((item) => item._id !== deleteTarget._id))
      toast.success(t("supplements.list.deleteSuccess"))
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error.response?.data?.message || t("supplements.list.deleteFailed"))
    } finally {
      setIsDeleting(false)
    }
  }

  const trimmedQuery = query.trim().toLowerCase()
  const visibleSupplements = trimmedQuery
    ? supplements.filter((supplement) => supplement.name.toLowerCase().includes(trimmedQuery))
    : supplements

  return (
    <AppLayout breadcrumb={t("sidebar.nav.supplements")}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="w-56 pl-8"
            placeholder={t("supplements.list.searchPlaceholder")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        {isAdmin && (
          <Button asChild>
            <Link to="/supplements/new">
              <Plus />
              {t("supplements.list.addSupplement")}
            </Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <CardGridSkeleton />
      ) : visibleSupplements.length === 0 ? (
        <EmptyState
          icon={Pill}
          title={t("supplements.list.empty.title")}
          description={
            supplements.length > 0
              ? t("supplements.list.empty.filteredDescription")
              : isAdmin
                ? t("supplements.list.empty.adminDescription")
                : t("supplements.list.empty.userDescription")
          }
          action={
            supplements.length === 0 &&
            isAdmin && (
              <Button asChild size="sm">
                <Link to="/supplements/new">
                  <Plus />
                  {t("supplements.list.addSupplement")}
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <CardGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleSupplements.map((supplement) => (
            <CardGridItem key={supplement._id}>
              <SupplementCard
                supplement={supplement}
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
            <AlertDialogTitle>{t("supplements.list.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("supplements.list.deleteDialog.description", { name: deleteTarget?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("supplements.list.deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? t("supplements.list.deleteDialog.deleting") : t("supplements.list.deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
