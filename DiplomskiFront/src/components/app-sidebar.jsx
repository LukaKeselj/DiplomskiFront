import { useState } from "react"
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

const data = {
  navMain: [
    { title: "Pregled", url: "/", icon: House },
    { title: "Treninzi", url: "/workout-plans", icon: Dumbbell },
    { title: "Vežbe", url: "/exercises", icon: ListChecks },
    { title: "Fitness Score", url: "/fitness-score", icon: Gauge },
    {
      title: "Napredak",
      icon: TrendingUp,
      items: [
        { title: "Telesna težina", url: "/body-weight" },
        { title: "Progres vežbi", url: "/exercise-progress" },
      ],
    },
    {
      title: "Ishrana",
      icon: Apple,
      items: [
        { title: "Dnevnik ishrane", url: "/nutrition-log" },
        { title: "Planovi ishrane", url: "/nutrition-plans" },
      ],
    },
    {
      title: "Suplementi",
      icon: Pill,
      items: [
        { title: "Svi suplementi", url: "/supplements" },
        { title: "Moj režim", url: "/my-supplements" },
      ],
    },
    { title: "Teretane", url: "/nearby-gyms", icon: MapPin },
  ],
}

const adminNavMain = [
  { title: "Treninzi", url: "/workout-plans", icon: Dumbbell },
  { title: "Vežbe", url: "/exercises", icon: ListChecks },
  {
    title: "Suplementi",
    icon: Pill,
    items: [
      { title: "Svi suplementi", url: "/supplements" },
      { title: "Dodaj suplement", url: "/supplements/new" },
      { title: "Moj režim", url: "/my-supplements" },
    ],
  },
  {
    title: "Ishrana",
    icon: Apple,
    items: [
      { title: "Dnevnik ishrane", url: "/nutrition-log" },
      { title: "Planovi ishrane", url: "/nutrition-plans" },
    ],
  },
  { title: "Teretane", url: "/nearby-gyms", icon: MapPin },
  { title: "Korisnici", url: "/", icon: Users },
]

function AdminHeader() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="pointer-events-none">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <ShieldCheck className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">IronLog</span>
            <span className="truncate text-xs">Administracija</span>
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

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {isAdmin ? <AdminHeader /> : <ProgramSwitcher />}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={isAdmin ? adminNavMain : data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser onOpenAccount={() => setIsAccountOpen(true)} />
      </SidebarFooter>
      <SidebarRail />
      <AccountSheet open={isAccountOpen} onOpenChange={setIsAccountOpen} />
    </Sidebar>
  )
}
