import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import EditModeToggle from '../shared/EditModeToggle';
import { Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 flex items-center justify-between border-b border-border px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <Link to="/" className="flex items-center gap-3">
                <img
                  src="/assets/logo.png"
                  alt="Logo da Academia"
                  className="h-12 w-auto object-contain"
                  onError={(e) => {
                    // Fallback para o ícone padrão se a imagem não carregar
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                  <Trophy className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">AcademyManager</span>
              </Link>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
      <EditModeToggle />
    </SidebarProvider>
  );
};

export default Layout;