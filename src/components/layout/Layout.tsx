import React from 'react';
import { 
  SidebarProvider, 
  SidebarTrigger,
  SidebarInset 
} from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import EditModeToggle from '../shared/EditModeToggle';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useLocation, Link } from 'react-router-dom';
import { usePlatform } from '@/hooks/usePlatform';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileLayout from './MobileLayout';

interface LayoutProps {
  children: React.ReactNode;
}

const routeNames: Record<string, string> = {
  '/': 'Home',
  '/financial': 'Financeiro',
  '/marketing': 'Marketing',
  '/nfs-e': 'Notas Fiscais',
  '/nfs-e/emit': 'Emitir NFS-e',
  '/roles': 'Funções',
  '/employees': 'Funcionários',
  '/teachers': 'Professores',
  '/enrollment': 'Matrícula',
  '/students': 'Alunos',
  '/students/new': 'Novo Aluno',
  '/calendar': 'Agenda',
  '/reports': 'Relatórios',
  '/modalities': 'Modalidades',
  '/events/new': 'Novo Evento',
  '/inaugural-class': 'Aula Inaugural',
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isNative } = usePlatform();
  const isMobile = useIsMobile();
  const currentPath = location.pathname;
  const pageName = routeNames[currentPath] || 'Página';

  // Mobile layout with bottom tabs (native OR small screen)
  if (isNative || isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  // Web layout with sidebar
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link to="/">Bayer Academy</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{pageName}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <main className="flex-1 pt-4">
            {children}
          </main>
        </div>
      </SidebarInset>
      <EditModeToggle />
    </SidebarProvider>
  );
};

export default Layout;
