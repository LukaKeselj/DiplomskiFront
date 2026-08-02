import { useEffect, useState } from "react"
import { Link } from "react-router"
import { useTranslation } from "react-i18next"
import { ChevronsUpDown, Dumbbell, Plus } from "lucide-react"

import { getWorkoutPlansRequest } from "@/api/workoutPlans"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext"
import { useActivateWorkoutPlan } from "@/hooks/use-activate-workout-plan"

export function ProgramSwitcher() {
  const { isMobile } = useSidebar()
  const { user } = useAuth()
  const [plans, setPlans] = useState([])
  const { isActivating, activate } = useActivateWorkoutPlan()
  const { t } = useTranslation()

  useEffect(() => {
    getWorkoutPlansRequest()
      .then(setPlans)
      .catch(() => {})
  }, [])

  const activePlan = plans.find((plan) => plan._id === user?.activeWorkoutPlan)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div
                className={
                  activePlan
                    ? "flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
                    : "flex aspect-square size-8 items-center justify-center rounded-lg border border-dashed border-sidebar-foreground/30 text-sidebar-foreground/50"
                }
              >
                <Dumbbell className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activePlan?.name ?? t("sidebar.noActivePlan")}
                </span>
                <span
                  className={
                    activePlan
                      ? "truncate text-xs text-primary"
                      : "truncate text-xs text-sidebar-foreground/50"
                  }
                >
                  {activePlan ? t("sidebar.active") : t("sidebar.selectPlan")}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {t("sidebar.myPlans")}
            </DropdownMenuLabel>
            {plans.length === 0 ? (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                {t("sidebar.noPlans")}
              </div>
            ) : (
              plans.map((plan, index) => (
                <DropdownMenuItem
                  key={plan._id}
                  disabled={isActivating || plan._id === user?.activeWorkoutPlan}
                  onClick={() => activate(plan._id)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <Dumbbell className="size-3.5 shrink-0" />
                  </div>
                  {plan.name}
                  {plan._id === user?.activeWorkoutPlan ? (
                    <DropdownMenuShortcut>✓</DropdownMenuShortcut>
                  ) : (
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="gap-2 p-2">
              <Link to="/workout-plans/new">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">{t("sidebar.newPlan")}</div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
