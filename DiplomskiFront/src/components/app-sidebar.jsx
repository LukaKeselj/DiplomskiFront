import { useState } from "react"
import {
  Activity,
  Apple,
  Dumbbell,
  Flame,
  Footprints,
  MapPin,
  Pill,
  Settings2,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react"

import { AccountSheet } from "@/components/account-sheet"
import { NavMain } from "@/components/nav-main"
import { NavRoutines } from "@/components/nav-routines"
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
  programs: [
    {
      name: "Push Pull Legs",
      logo: Dumbbell,
      status: "Aktivan",
    },
    {
      name: "Full Body",
      logo: Activity,
      status: "Pauziran",
    },
    {
      name: "5x5 Snaga",
      logo: Flame,
      status: "Nacrt",
    },
  ],
  navMain: [
    {
      title: "Treninzi",
      url: "#",
      icon: Dumbbell,
      isActive: true,
      items: [
        { title: "Planovi treninga", url: "/workout-plans" },
        { title: "Istorija", url: "#" },
        { title: "Šabloni", url: "#" },
        { title: "Novi trening", url: "#" },
      ],
    },
    {
      title: "Vežbe",
      url: "#",
      icon: Dumbbell,
      items: [{ title: "Sve vežbe", url: "/exercises" }],
    },
    {
      title: "Napredak",
      url: "#",
      icon: TrendingUp,
      items: [
        { title: "Telesna težina", url: "#" },
        { title: "Statistika", url: "#" },
        { title: "Grafici", url: "#" },
      ],
    },
    {
      title: "Ishrana",
      url: "#",
      icon: Apple,
      items: [
        { title: "Dnevnik ishrane", url: "/nutrition-log" },
        { title: "Kalorije", url: "#" },
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
      items: [
        { title: "Profil", url: "#" },
        { title: "Nalog", url: "#", action: "account" },
      ],
    },
  ],
  routines: [
    { name: "Push Day", url: "#", icon: Flame },
    { name: "Pull Day", url: "#", icon: Activity },
    { name: "Leg Day", url: "#", icon: Footprints },
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
    icon: Dumbbell,
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
    items: [{ title: "Dnevnik ishrane", url: "/nutrition-log" }],
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

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {isAdmin ? <AdminHeader /> : <ProgramSwitcher programs={data.programs} />}
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={isAdmin ? adminNavMain : data.navMain}
          onOpenAccount={() => setIsAccountOpen(true)}
        />
        {!isAdmin && <NavRoutines routines={data.routines} />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser onOpenAccount={() => setIsAccountOpen(true)} />
      </SidebarFooter>
      <SidebarRail />
      <AccountSheet open={isAccountOpen} onOpenChange={setIsAccountOpen} />
    </Sidebar>
  )
}
