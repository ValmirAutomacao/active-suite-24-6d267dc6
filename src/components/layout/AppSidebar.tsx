"use client"

import * as React from "react"
import {
  Home,
  DollarSign,
  Users,
  GraduationCap,
  UserPlus,
  Calendar,
  Building,
  UserCog,
  FileText,
  TrendingUp,
  PieChart,
  Trophy,
  Megaphone,
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  FolderPlus,
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import { NavMain } from "@/components/layout/nav-main"
import { TeamSwitcher } from "@/components/layout/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navMainItems = [
  {
    title: "Administração",
    label: "Administração",
    icon: Building,
    items: [
      { title: "Financeiro", url: "/financial", icon: DollarSign },
      { title: "Ficha Financeira", url: "/student-financial", icon: FileText },
      { title: "Marketing", url: "/marketing", icon: Megaphone },
      { title: "Notas Fiscais", url: "/nfs-e", icon: FileText },
      { title: "Funções", url: "/roles", icon: UserCog },
      { title: "Funcionários", url: "/employees", icon: Building },
    ],
  },
  {
    title: "Alunos",
    label: "Alunos",
    icon: Users,
    items: [
      { title: "Professores", url: "/teachers", icon: GraduationCap },
      { title: "Matrícula", url: "/enrollment", icon: UserPlus },
      { title: "Alunos Geral", url: "/students", icon: Users },
      { title: "Agenda", url: "/calendar", icon: Calendar },
    ],
  },
  {
    title: "Relatórios",
    label: "Relatórios",
    icon: BarChart3,
    items: [
      { title: "Analytics & ABC", url: "/reports", icon: TrendingUp },
      { title: "Dashboard", url: "/", icon: PieChart },
    ],
  },
  {
    title: "Cadastros",
    label: "Cadastros",
    icon: FolderPlus,
    items: [
      { title: "Modalidades", url: "/modalities", icon: Trophy },
      { title: "Novo Aluno", url: "/students/new", icon: UserPlus },
      { title: "Novo Evento", url: "/events/new", icon: Calendar },
      { title: "Aula Inaugural", url: "/inaugural-class", icon: GraduationCap },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const currentPath = location.pathname

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {/* Home - Item direto */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Home">
                <NavLink 
                  to="/" 
                  end
                  className={({ isActive }) => 
                    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                  }
                >
                  <Home />
                  <span>Home</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <NavMain items={navMainItems} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
