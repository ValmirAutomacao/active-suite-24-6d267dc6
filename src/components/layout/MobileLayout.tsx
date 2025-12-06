import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import MobileBottomNav from './MobileBottomNav';
import MobileMenuDrawer from './MobileMenuDrawer';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const routeNames: Record<string, string> = {
  '/': 'Bayer Academy',
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

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const pageName = routeNames[currentPath] || 'Bayer Academy';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border safe-area-top">
        <div className="flex items-center justify-center h-14 px-4">
          <h1 className="text-lg font-semibold text-foreground truncate">
            {pageName}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20">
        <div className="p-4">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <MobileBottomNav onMenuClick={() => setMenuOpen(true)} />

      {/* Menu Drawer */}
      <MobileMenuDrawer open={menuOpen} onOpenChange={setMenuOpen} />
    </div>
  );
};

export default MobileLayout;
