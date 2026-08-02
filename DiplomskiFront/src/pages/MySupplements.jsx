import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
import { Pencil, Pill, Plus, Trash2 } from "lucide-react"

import {
  deleteUserSupplementRequest,
  getSupplementLogsRequest,
  getSupplementsRequest,
  getUserSupplementsRequest,
  logSupplementTakenRequest,
} from "@/api/supplements"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CardGrid, CardGridItem } from "@/components/ui/card-grid"
import { Checkbox } from "@/components/ui/checkbox"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"

function todayDateString() {
  return new Date().toISOString().slice(0, 10)
}

export default function MySupplements() {
  const { t } = useTranslation()
  const today = useMemo(() => todayDateString(), [])
  const [userSupplements, setUserSupplements] = useState([])
  const [supplements, setSupplements] = useState([])
  const [takenMap, setTakenMap] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    Promise.all([
      getUserSupplementsRequest(),
      getSupplementsRequest(),
      getSupplementLogsRequest({ date: today }),
    ])
      .then(([userSupplementsData, supplementsData, logsData]) => {
        setUserSupplements(userSupplementsData)
        setSupplements(supplementsData)
        const map = {}
        logsData.forEach((log) => {
          map[log.supplement] = log.taken
        })
        setTakenMap(map)
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || t("supplements.mySupplements.loadError"))
      })
      .finally(() => setIsLoading(false))
  }, [today, t])

  const supplementById = useMemo(() => {
    const map = new Map()
    supplements.forEach((supplement) => map.set(supplement._id, supplement))
    return map
  }, [supplements])

  async function handleToggleTaken(userSupplementId, nextTaken) {
    setTakenMap((prev) => ({ ...prev, [userSupplementId]: nextTaken }))
    try {
      await logSupplementTakenRequest({
        supplement: userSupplementId,
        date: today,
        taken: nextTaken,
      })
    } catch (error) {
      setTakenMap((prev) => ({ ...prev, [userSupplementId]: !nextTaken }))
      toast.error(error.response?.data?.message || t("supplements.mySupplements.toggleFailed"))
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return

    setIsDeleting(true)
    try {
      await deleteUserSupplementRequest(deleteTarget._id)
      setUserSupplements((prev) => prev.filter((item) => item._id !== deleteTarget._id))
      toast.success(t("supplements.mySupplements.removeSuccess"))
      setDeleteTarget(null)
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(t("supplements.mySupplements.deleteForbidden"))
      } else {
        toast.error(error.response?.data?.message || t("supplements.mySupplements.deleteFailed"))
      }
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AppLayout breadcrumb={t("sidebar.nav.mySupplements")}>
      <div className="flex justify-end">
        <Button asChild>
          <Link to="/my-supplements/new">
            <Plus />
            {t("supplements.mySupplements.addSupplement")}
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 shrink-0 rounded-full" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : userSupplements.length === 0 ? (
        <EmptyState
          icon={Pill}
          title={t("supplements.mySupplements.empty.title")}
          description={t("supplements.mySupplements.empty.description")}
          action={
            <Button asChild size="sm">
              <Link to="/my-supplements/new">
                <Plus />
                {t("supplements.mySupplements.addSupplement")}
              </Link>
            </Button>
          }
        />
      ) : (
        <CardGrid className="flex flex-col gap-3">
          {userSupplements.map((item) => {
            const supplement = supplementById.get(item.supplement)
            return (
              <CardGridItem key={item._id} hover={false}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar size="lg" className="size-10">
                        <AvatarImage
                          src={supplement?.imageUrl}
                          alt={supplement?.name}
                          className="object-contain"
                        />
                        <AvatarFallback>
                          {(supplement?.name ?? "?").trim().slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{supplement?.name ?? t("supplements.mySupplements.unknownSupplement")}</CardTitle>
                        <CardDescription>
                          {item.dosage} • {item.timeOfDay}
                          {!item.active && t("supplements.mySupplements.inactiveSuffix")}
                        </CardDescription>
                        {supplement?.description && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {supplement.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <CardAction className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={Boolean(takenMap[item._id])}
                          onCheckedChange={(checked) =>
                            handleToggleTaken(item._id, checked === true)
                          }
                        />
                        {t("supplements.mySupplements.takenToday")}
                      </label>
                      <Button variant="outline" size="icon" asChild>
                        <Link to={`/my-supplements/${item._id}/edit`}>
                          <Pencil />
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => setDeleteTarget(item)}
                      >
                        <Trash2 />
                      </Button>
                    </CardAction>
                  </CardHeader>
                </Card>
              </CardGridItem>
            )
          })}
        </CardGrid>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("supplements.mySupplements.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("supplements.mySupplements.deleteDialog.description", {
                name:
                  supplementById.get(deleteTarget?.supplement)?.name ??
                  t("supplements.mySupplements.deleteDialog.fallbackName"),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("supplements.mySupplements.deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting
                ? t("supplements.mySupplements.deleteDialog.deleting")
                : t("supplements.mySupplements.deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
