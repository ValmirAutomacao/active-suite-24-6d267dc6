import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import GuardianMobileBottomNav from './GuardianMobileBottomNav';
import GuardianMenuDrawer from './GuardianMenuDrawer';

const routeNames: Record<string, string> = {
  '/guardian': 'Início',
  '/guardian/inaugural': 'Aula Inaugural',
  '/guardian/inaugural-dashboard': 'Aula Inaugural',
  '/guardian/enrollment': 'Matrícula',
  '/guardian/dashboard': 'Minha Área',
  '/guardian/student': 'Dados do Aluno',
  '/guardian/payments': 'Mensalidades',
  '/guardian/schedule': 'Agenda',
  '/guardian/contract': 'Contrato',
};

const GuardianMobileLayout: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const pageName = routeNames[currentPath] || 'Bayer Academy';

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-4 safe-area-top">
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

      {/* Main Content */}
      <main className="flex-1 overflow-auto overscroll-contain">
        <div className="pb-24">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation */}
      <GuardianMobileBottomNav onMenuClick={() => setMenuOpen(true)} />

      {/* Menu Drawer */}
      <GuardianMenuDrawer open={menuOpen} onOpenChange={setMenuOpen} />
    </div>
  );
};

export default GuardianMobileLayout;
