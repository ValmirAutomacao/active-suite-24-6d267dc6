"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

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

export function NavMain({
  items,
}: {
  items: {
    title: string
    label: string
    icon?: LucideIcon
    items: {
      title: string
      url: string
      icon?: LucideIcon
    }[]
  }[]
}) {
  const location = useLocation()
  const currentPath = location.pathname

  return (
    <>
      {items.map((group) => {
        const hasActiveItem = group.items.some(item => currentPath === item.url)
        
        return (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              <Collapsible
                asChild
                defaultOpen={hasActiveItem}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={group.title}>
                      {group.icon && <group.icon />}
                      <span>{group.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {group.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <NavLink 
                              to={subItem.url}
                              className={({ isActive }) => 
                                isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                              }
                            >
                              {subItem.icon && <subItem.icon className="h-4 w-4" />}
                              <span>{subItem.title}</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroup>
        )
      })}
    </>
  )
}
