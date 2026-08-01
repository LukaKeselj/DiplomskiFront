import { useEffect, useState } from "react"
import toast from "react-hot-toast"
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

export default function Home() {
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
        toast.error(error.response?.data?.message || "Neuspešno učitavanje korisnika")
      })
      .finally(() => setIsLoadingUsers(false))

    getExercisesRequest()
      .then((exercises) => setExerciseCount(exercises.length))
      .catch((error) => {
        toast.error(error.response?.data?.message || "Neuspešno učitavanje vežbi")
      })
      .finally(() => setIsLoadingExercises(false))
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
      toast.success(updatedUser.isBlocked ? "Korisnik je blokiran" : "Korisnik je odblokiran")
    } catch (error) {
      toast.error(error.response?.data?.message || "Neuspešna izmena statusa korisnika")
    } finally {
      setIsTogglingBlock(false)
    }
  }

  const breadcrumb = isAdmin ? "Korisnici" : "Pregled"

  return (
    <AppLayout breadcrumb={breadcrumb}>
      {isAdmin ? (
        <>
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="flex flex-col justify-between rounded-xl bg-muted/50 p-4">
              <span className="text-sm text-muted-foreground">Ukupno korisnika</span>
              {isLoadingUsers ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <span className="text-2xl font-semibold">{totalUsers}</span>
              )}
            </div>
            <div className="flex flex-col justify-between rounded-xl bg-muted/50 p-4">
              <span className="text-sm text-muted-foreground">Blokirani korisnici</span>
              {isLoadingUsers ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <span className="text-2xl font-semibold">{blockedUsers}</span>
              )}
            </div>
            <div className="flex flex-col justify-between rounded-xl bg-muted/50 p-4">
              <span className="text-sm text-muted-foreground">Vežbe u bazi</span>
              {isLoadingExercises ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <span className="text-2xl font-semibold">{exerciseCount}</span>
              )}
            </div>
          </div>
          <div className="flex-1 rounded-xl bg-muted/50 p-4">
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">Korisnici</h2>
            {isLoadingUsers ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <EmptyState icon={Users} title="Nema korisnika za prikaz" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">Ime i prezime</th>
                      <th className="pb-2 pr-4 font-medium">Korisničko ime</th>
                      <th className="pb-2 pr-4 font-medium">Email</th>
                      <th className="pb-2 pr-4 font-medium">Uloga</th>
                      <th className="pb-2 font-medium">Status</th>
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
                            {u.isBlocked ? "Blokiran" : "Aktivan"}
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
              Zdravo{user?.name ? `, ${user.name}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground">{formatFullDateLabel(new Date())}</p>
          </div>
          <HomeFitnessScoreWidget refreshKey={scoreRefreshKey} />
          <HomeCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            refreshKey={nutritionRefreshKey}
          />
          <WeeklyWeightBanner onWeightLogged={bumpScoreRefresh} />
          <Separator />
          <HomeStopwatchWidget />
          <HomeWorkoutWidget date={selectedDate} onSessionChange={bumpScoreRefresh} />
          <div className="grid items-start gap-4 md:grid-cols-2">
            <HomeNutritionWidget
              date={selectedDate}
              onLogChange={() => {
                setNutritionRefreshKey((key) => key + 1)
                bumpScoreRefresh()
              }}
            />
            <HomeSupplementsWidget date={selectedDate} onSupplementChange={bumpScoreRefresh} />
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
                  <span className="text-muted-foreground">Korisničko ime</span>
                  <span>{selectedUser.username}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Visina</span>
                  <span>{selectedUser.height} cm</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Uloga</span>
                  <span className="capitalize">{selectedUser.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      selectedUser.isBlocked
                        ? "bg-destructive/10 text-destructive"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    )}
                  >
                    {selectedUser.isBlocked ? "Blokiran" : "Aktivan"}
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
                  ? "Sačuvavanje..."
                  : selectedUser?.isBlocked
                    ? "Odblokiraj korisnika"
                    : "Blokiraj korisnika"}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </AppLayout>
  )
}
