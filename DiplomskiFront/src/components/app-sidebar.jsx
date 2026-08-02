import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Apple,
  Dumbbell,
  Gauge,
  House,
  ListChecks,
  MapPin,
  Pill,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react"

import { AccountSheet } from "@/components/account-sheet"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { ProgramSwitcher } from "@/components/program-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext"

function getNavMain(t) {
  return [
    { title: t("sidebar.nav.overview"), url: "/", icon: House },
    { title: t("sidebar.nav.workouts"), url: "/workout-plans", icon: Dumbbell },
    { title: t("sidebar.nav.exercises"), url: "/exercises", icon: ListChecks },
    { title: t("sidebar.nav.fitnessScore"), url: "/fitness-score", icon: Gauge },
    {
      title: t("sidebar.nav.progress"),
      icon: TrendingUp,
      items: [
        { title: t("sidebar.nav.bodyWeight"), url: "/body-weight" },
        { title: t("sidebar.nav.exerciseProgress"), url: "/exercise-progress" },
      ],
    },
    {
      title: t("sidebar.nav.nutrition"),
      icon: Apple,
      items: [
        { title: t("sidebar.nav.nutritionLog"), url: "/nutrition-log" },
        { title: t("sidebar.nav.nutritionPlans"), url: "/nutrition-plans" },
      ],
    },
    {
      title: t("sidebar.nav.supplements"),
      icon: Pill,
      items: [
        { title: t("sidebar.nav.allSupplements"), url: "/supplements" },
        { title: t("sidebar.nav.mySupplements"), url: "/my-supplements" },
      ],
    },
    { title: t("sidebar.nav.gyms"), url: "/nearby-gyms", icon: MapPin },
  ]
}

function getAdminNavMain(t) {
  return [
    { title: t("sidebar.nav.workouts"), url: "/workout-plans", icon: Dumbbell },
    { title: t("sidebar.nav.exercises"), url: "/exercises", icon: ListChecks },
    {
      title: t("sidebar.nav.supplements"),
      icon: Pill,
      items: [
        { title: t("sidebar.nav.allSupplements"), url: "/supplements" },
        { title: t("sidebar.nav.addSupplement"), url: "/supplements/new" },
        { title: t("sidebar.nav.mySupplements"), url: "/my-supplements" },
      ],
    },
    {
      title: t("sidebar.nav.nutrition"),
      icon: Apple,
      items: [
        { title: t("sidebar.nav.nutritionLog"), url: "/nutrition-log" },
        { title: t("sidebar.nav.nutritionPlans"), url: "/nutrition-plans" },
      ],
    },
    { title: t("sidebar.nav.gyms"), url: "/nearby-gyms", icon: MapPin },
    { title: t("sidebar.nav.users"), url: "/", icon: Users },
  ]
}

function AdminHeader() {
  const { t } = useTranslation()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="pointer-events-none">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <ShieldCheck className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{t("common.appName")}</span>
            <span className="truncate text-xs">{t("sidebar.administration")}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function AppSidebar({ ...props }) {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {isAdmin ? <AdminHeader /> : <ProgramSwitcher />}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={isAdmin ? getAdminNavMain(t) : getNavMain(t)} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser onOpenAccount={() => setIsAccountOpen(true)} />
      </SidebarFooter>
      <SidebarRail />
      <AccountSheet open={isAccountOpen} onOpenChange={setIsAccountOpen} />
    </Sidebar>
  )
}
