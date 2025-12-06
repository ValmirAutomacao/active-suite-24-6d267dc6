import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import MobileBottomNav from './MobileBottomNav';
import MobileMenuDrawer from './MobileMenuDrawer';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
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
    <div className="min-h-screen bg-background flex flex-col mobile-full-screen">
      {/* Mobile Header - Glassmorphism Effect */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 safe-area-top">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center overflow-hidden">
              <img src="/favicon.ico" alt="Logo" className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">
                {pageName}
              </h1>
              <p className="text-[10px] text-muted-foreground">Bayer Academy</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Optimized for mobile scrolling */}
      <main className="flex-1 overflow-auto pb-20 overscroll-contain">
        <div className="mobile-content-wrapper">
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