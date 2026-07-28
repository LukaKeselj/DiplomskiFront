import { ChevronRight } from "lucide-react"
import { Link, useLocation } from "react-router"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useSidebarNav } from "@/context/SidebarNavContext"

export function NavMain({ items, onOpenAccount }) {
  const location = useLocation()
  const currentUrl = `${location.pathname}${location.search}`
  const { openSections, setSectionOpen } = useSidebarNav()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platforma</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasActiveChild = item.items?.some(
            (subItem) => subItem.url === currentUrl
          )
          const isOpen = openSections[item.title] ?? (hasActiveChild || item.isActive)

          return (
          <Collapsible
            key={item.title}
            asChild
            open={isOpen}
            onOpenChange={(open) => setSectionOpen(item.title, open)}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title} isActive={hasActiveChild}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) =>
                    subItem.action === "account" ? (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton onClick={onOpenAccount}>
                          <span>{subItem.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ) : (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild isActive={subItem.url === currentUrl}>
                          <Link to={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )
                  )}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
