import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
import { Users } from "lucide-react"

import { getAllUsersRequest, setUserBlockedStatusRequest } from "@/api/users"
import { getExercisesRequest } from "@/api/exercises"
import { AppLayout } from "@/components/app-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useAuth } from "@/context/AuthContext"
import { cn, formatFullDateLabel } from "@/lib/utils"
import { WeeklyWeightBanner } from "@/components/weekly-weight-banner"
import { HomeFitnessScoreWidget } from "@/components/home-fitness-score-widget"
import { HomeWorkoutWidget } from "@/components/home-workout-widget"
import { HomeNutritionWidget } from "@/components/home-nutrition-widget"
import { HomeSupplementsWidget } from "@/components/home-supplements-widget"
import { HomeStopwatchWidget } from "@/components/home-stopwatch-widget"
import { HomeCalendar } from "@/components/home-calendar"
import { MotionSection } from "@/components/ui/motion-section"

export default function Home() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"
  const [users, setUsers] = useState([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [exerciseCount, setExerciseCount] = useState(0)
  const [isLoadingExercises, setIsLoadingExercises] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isTogglingBlock, setIsTogglingBlock] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [nutritionRefreshKey, setNutritionRefreshKey] = useState(0)
  const [scoreRefreshKey, setScoreRefreshKey] = useState(0)

  function bumpScoreRefresh() {
    setScoreRefreshKey((key) => key + 1)
  }

  useEffect(() => {
    if (!isAdmin) return

    getAllUsersRequest()
      .then(setUsers)
      .catch((error) => {
        toast.error(error.response?.data?.message || t("home.admin.toasts.loadUsersError"))
      })
      .finally(() => setIsLoadingUsers(false))

    getExercisesRequest()
      .then((exercises) => setExerciseCount(exercises.length))
      .catch((error) => {
        toast.error(error.response?.data?.message || t("home.admin.toasts.loadExercisesError"))
      })
      .finally(() => setIsLoadingExercises(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  const totalUsers = users.length
  const blockedUsers = users.filter((u) => u.isBlocked).length

  async function handleToggleBlock() {
    if (!selectedUser) return

    setIsTogglingBlock(true)
    try {
      const updatedUser = await setUserBlockedStatusRequest(
        selectedUser._id,
        !selectedUser.isBlocked
      )
      setUsers((prev) => prev.map((u) => (u._id === updatedUser._id ? updatedUser : u)))
      setSelectedUser(updatedUser)
      toast.success(
        updatedUser.isBlocked
          ? t("home.admin.toasts.userBlocked")
          : t("home.admin.toasts.userUnblocked")
      )
    } catch (error) {
      toast.error(error.response?.data?.message || t("home.admin.toasts.toggleBlockError"))
    } finally {
      setIsTogglingBlock(false)
    }
  }

  const breadcrumb = isAdmin ? t("sidebar.nav.users") : t("sidebar.nav.overview")

  return (
    <AppLayout breadcrumb={breadcrumb}>
      {isAdmin ? (
        <>
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="flex flex-col justify-between rounded-xl bg-muted/50 p-4">
              <span className="text-sm text-muted-foreground">{t("home.admin.statTiles.totalUsers")}</span>
              {isLoadingUsers ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <span className="text-2xl font-semibold">{totalUsers}</span>
              )}
            </div>
            <div className="flex flex-col justify-between rounded-xl bg-muted/50 p-4">
              <span className="text-sm text-muted-foreground">{t("home.admin.statTiles.blockedUsers")}</span>
              {isLoadingUsers ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <span className="text-2xl font-semibold">{blockedUsers}</span>
              )}
            </div>
            <div className="flex flex-col justify-between rounded-xl bg-muted/50 p-4">
              <span className="text-sm text-muted-foreground">{t("home.admin.statTiles.exercisesInDb")}</span>
              {isLoadingExercises ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <span className="text-2xl font-semibold">{exerciseCount}</span>
              )}
            </div>
          </div>
          <div className="flex-1 rounded-xl bg-muted/50 p-4">
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">{t("home.admin.usersSection.title")}</h2>
            {isLoadingUsers ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <EmptyState icon={Users} title={t("home.admin.usersSection.emptyTitle")} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">{t("home.admin.usersSection.table.fullName")}</th>
                      <th className="pb-2 pr-4 font-medium">{t("home.admin.usersSection.table.username")}</th>
                      <th className="pb-2 pr-4 font-medium">{t("home.admin.usersSection.table.email")}</th>
                      <th className="pb-2 pr-4 font-medium">{t("home.admin.usersSection.table.role")}</th>
                      <th className="pb-2 font-medium">{t("home.admin.usersSection.table.status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={u._id}
                        onClick={() => setSelectedUser(u)}
                        className="cursor-pointer border-b transition-colors last:border-0 hover:bg-muted"
                      >
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="size-7">
                              <AvatarImage src={u.profileImage} alt={`${u.name} ${u.surname}`} />
                              <AvatarFallback className="text-xs">
                                {`${u.name?.[0] ?? ""}${u.surname?.[0] ?? ""}`.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {`${u.name} ${u.surname}`}
                          </div>
                        </td>
                        <td className="py-2 pr-4">{u.username}</td>
                        <td className="py-2 pr-4">{u.email}</td>
                        <td className="py-2 pr-4 capitalize">{u.role}</td>
                        <td className="py-2">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-medium",
                              u.isBlocked
                                ? "bg-destructive/10 text-destructive"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            )}
                          >
                            {u.isBlocked
                              ? t("home.admin.usersSection.statusBlocked")
                              : t("home.admin.usersSection.statusActive")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div>
            <h1 className="font-heading text-2xl font-semibold">
              {t("home.greeting", { name: user?.name ? `, ${user.name}` : "" })}
            </h1>
            <p className="text-sm text-muted-foreground">{formatFullDateLabel(new Date())}</p>
          </div>
          <MotionSection>
            <HomeFitnessScoreWidget refreshKey={scoreRefreshKey} />
          </MotionSection>
          <MotionSection>
            <HomeCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              refreshKey={nutritionRefreshKey}
            />
          </MotionSection>
          <MotionSection>
            <WeeklyWeightBanner onWeightLogged={bumpScoreRefresh} />
          </MotionSection>
          <Separator />
          <MotionSection>
            <HomeStopwatchWidget />
          </MotionSection>
          <MotionSection>
            <HomeWorkoutWidget date={selectedDate} onSessionChange={bumpScoreRefresh} />
          </MotionSection>
          <div className="grid items-start gap-4 md:grid-cols-2">
            <MotionSection>
              <HomeNutritionWidget
                date={selectedDate}
                onLogChange={() => {
                  setNutritionRefreshKey((key) => key + 1)
                  bumpScoreRefresh()
                }}
              />
            </MotionSection>
            <MotionSection>
              <HomeSupplementsWidget date={selectedDate} onSupplementChange={bumpScoreRefresh} />
            </MotionSection>
          </div>
        </>
      )}
      {isAdmin && (
        <Sheet open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                {selectedUser && `${selectedUser.name} ${selectedUser.surname}`}
              </SheetTitle>
              <SheetDescription>{selectedUser?.email}</SheetDescription>
            </SheetHeader>
            {selectedUser && (
              <div className="flex flex-col gap-3 px-4 text-sm">
                <Avatar className="size-16">
                  <AvatarImage
                    src={selectedUser.profileImage}
                    alt={`${selectedUser.name} ${selectedUser.surname}`}
                  />
                  <AvatarFallback className="text-lg">
                    {`${selectedUser.name?.[0] ?? ""}${selectedUser.surname?.[0] ?? ""}`.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("home.admin.sheet.usernameLabel")}</span>
                  <span>{selectedUser.username}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("home.admin.sheet.heightLabel")}</span>
                  <span>{selectedUser.height} cm</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("home.admin.sheet.roleLabel")}</span>
                  <span className="capitalize">{selectedUser.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("home.admin.sheet.statusLabel")}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      selectedUser.isBlocked
                        ? "bg-destructive/10 text-destructive"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    )}
                  >
                    {selectedUser.isBlocked
                      ? t("home.admin.usersSection.statusBlocked")
                      : t("home.admin.usersSection.statusActive")}
                  </span>
                </div>
              </div>
            )}
            <SheetFooter>
              <Button
                variant={selectedUser?.isBlocked ? "outline" : "destructive"}
                disabled={isTogglingBlock}
                onClick={handleToggleBlock}
              >
                {isTogglingBlock
                  ? t("home.admin.sheet.saving")
                  : selectedUser?.isBlocked
                    ? t("home.admin.sheet.unblockUser")
                    : t("home.admin.sheet.blockUser")}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </AppLayout>
  )
}
