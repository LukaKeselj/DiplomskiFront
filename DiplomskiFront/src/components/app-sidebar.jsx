import { useState } from "react"
import { Link, useLocation } from "react-router"
import {
  Apple,
  Dumbbell,
  House,
  ListChecks,
  MapPin,
  Pill,
  Settings2,
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
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext"

const data = {
  navMain: [
    {
      title: "Treninzi",
      url: "#",
      icon: Dumbbell,
      isActive: true,
      items: [{ title: "Planovi treninga", url: "/workout-plans" }],
    },
    {
      title: "Vežbe",
      url: "#",
      icon: ListChecks,
      items: [{ title: "Sve vežbe", url: "/exercises" }],
    },
    {
      title: "Napredak",
      url: "#",
      icon: TrendingUp,
      items: [{ title: "Telesna težina", url: "/body-weight" }],
    },
    {
      title: "Ishrana",
      url: "#",
      icon: Apple,
      items: [
        { title: "Dnevnik ishrane", url: "/nutrition-log" },
        { title: "Planovi ishrane", url: "/nutrition-plans" },
      ],
    },
    {
      title: "Suplementi",
      url: "#",
      icon: Pill,
      items: [
        { title: "Katalog", url: "/supplements" },
        { title: "Moj režim", url: "/my-supplements" },
      ],
    },
    {
      title: "Teretane",
      url: "#",
      icon: MapPin,
      items: [{ title: "U okolini", url: "/nearby-gyms" }],
    },
    {
      title: "Podešavanja",
      url: "#",
      icon: Settings2,
      items: [{ title: "Nalog", url: "#", action: "account" }],
    },
  ],
}

const adminNavMain = [
  {
    title: "Treninzi",
    url: "#",
    icon: Dumbbell,
    isActive: true,
    items: [{ title: "Planovi treninga", url: "/workout-plans" }],
  },
  {
    title: "Vežbe",
    url: "#",
    icon: ListChecks,
    isActive: true,
    items: [
      { title: "Sve vežbe", url: "/exercises" },
      { title: "Dodaj vežbu", url: "/exercises/new" },
    ],
  },
  {
    title: "Suplementi",
    url: "#",
    icon: Pill,
    items: [
      { title: "Katalog", url: "/supplements" },
      { title: "Dodaj suplement", url: "/supplements/new" },
      { title: "Moj režim", url: "/my-supplements" },
    ],
  },
  {
    title: "Ishrana",
    url: "#",
    icon: Apple,
    items: [
      { title: "Dnevnik ishrane", url: "/nutrition-log" },
      { title: "Planovi ishrane", url: "/nutrition-plans" },
    ],
  },
  {
    title: "Teretane",
    url: "#",
    icon: MapPin,
    items: [{ title: "U okolini", url: "/nearby-gyms" }],
  },
  {
    title: "Korisnici",
    url: "#",
    icon: Users,
    items: [
      { title: "Svi korisnici", url: "/" },
      { title: "Blokirani korisnici", url: "/?usersView=blocked" },
    ],
  },
  {
    title: "Podešavanja",
    url: "#",
    icon: Settings2,
    items: [{ title: "Nalog", url: "#", action: "account" }],
  },
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
  const location = useLocation()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {isAdmin ? <AdminHeader /> : <ProgramSwitcher />}
      </SidebarHeader>
      <SidebarContent>
        {!isAdmin && (
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/"} tooltip="Pregled">
                  <Link to="/">
                    <House />
                    <span>Pregled</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
        <NavMain
          items={isAdmin ? adminNavMain : data.navMain}
          onOpenAccount={() => setIsAccountOpen(true)}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser onOpenAccount={() => setIsAccountOpen(true)} />
      </SidebarFooter>
      <SidebarRail />
      <AccountSheet open={isAccountOpen} onOpenChange={setIsAccountOpen} />
    </Sidebar>
  )
}
