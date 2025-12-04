import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Settings,
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
  ChevronDown,
  LogOut,
  Megaphone
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const menuGroups = [
  {
    label: 'Principal',
    items: [
      { title: 'Home', url: '/', icon: Home }
    ]
  },
  {
    label: 'Administração',
    items: [
      { title: 'Financeiro', url: '/financial', icon: DollarSign },
      { title: 'Marketing', url: '/marketing', icon: Megaphone },
      { title: 'Notas Fiscais', url: '/nfs-e', icon: FileText },
      { title: 'Funções', url: '/roles', icon: UserCog },
      { title: 'Funcionários', url: '/employees', icon: Building }
    ]
  },
  {
    label: 'Alunos',
    items: [
      { title: 'Professores', url: '/teachers', icon: GraduationCap },
      { title: 'Matrícula', url: '/enrollment', icon: UserPlus },
      { title: 'Alunos Geral', url: '/students', icon: Users },
      { title: 'Agenda', url: '/calendar', icon: Calendar }
    ]
  },
  {
    label: 'Relatórios',
    items: [
      { title: 'Analytics & ABC', url: '/reports', icon: TrendingUp },
      { title: 'Dashboard', url: '/', icon: PieChart }
    ]
  },
  {
    label: 'Cadastros',
    items: [
      { title: 'Modalidades', url: '/modalities', icon: Trophy },
      { title: 'Novo Aluno', url: '/students/new', icon: UserPlus },
      { title: 'Novo Evento', url: '/events/new', icon: Calendar },
      { title: 'Aula Inaugural', url: '/inaugural-class', icon: GraduationCap }
    ]
  }
];

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);
  const { user, signOut, isLoading: isAuthLoading } = useAuth();

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50';

  const toggleGroup = (index: number) => {
    setExpandedGroups(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Opcional: exibir uma notificação de erro ao usuário
      // toast.error('Falha ao fazer logout. Tente novamente.');
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        {menuGroups.map((group, index) => {
          const hasActiveItem = group.items.some(item => isActive(item.url));
          const isExpanded = expandedGroups.includes(index) || hasActiveItem;
          
          return (
            <SidebarGroup key={index}>
              <div 
                className="flex items-center justify-between cursor-pointer p-2"
                onClick={() => toggleGroup(index)}
              >
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
              {isExpanded && (
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink to={item.url} end className={getNavCls}>
                            <item.icon className="mr-2 h-4 w-4" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
          );
        })}
        
        {/* Botão de Logout - aparece apenas quando o usuário estiver autenticado */}
        {user && (
          <div className="p-2 mt-auto">
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={handleLogout}
              disabled={isAuthLoading}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isAuthLoading ? 'Saindo...' : 'Sair'}</span>
            </Button>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}