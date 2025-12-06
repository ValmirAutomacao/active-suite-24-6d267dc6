import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { 
  Home,
  User,
  CreditCard,
  Calendar,
  FileText,
  LogOut,
  ChevronRight,
  X
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface GuardianMenuDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const menuItems = [
  { path: '/guardian', label: 'Início', icon: Home, exact: true },
  { path: '/guardian/student', label: 'Dados do Aluno', icon: User },
  { path: '/guardian/payments', label: 'Mensalidades', icon: CreditCard },
  { path: '/guardian/schedule', label: 'Agenda', icon: Calendar },
  { path: '/guardian/contract', label: 'Contrato', icon: FileText },
];

const GuardianMenuDrawer: React.FC<GuardianMenuDrawerProps> = ({ open, onOpenChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] bg-background flex flex-col">
        {/* Header */}
        <DrawerHeader className="flex items-center justify-between border-b border-border pb-4 px-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <img src="/favicon.ico" alt="Logo" className="w-6 h-6" />
            </div>
            <div>
              <DrawerTitle className="text-lg font-bold text-foreground">Bayer Academy</DrawerTitle>
              <p className="text-xs text-muted-foreground">
                {profile?.full_name || 'Área do Responsável'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => onOpenChange(false)}
            className="p-2.5 rounded-full bg-muted/50 hover:bg-muted active:scale-95 transition-all duration-200"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </DrawerHeader>
        
        <ScrollArea className="flex-1 px-4 py-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 active:scale-[0.98]",
                    active 
                      ? "bg-primary/15 border border-primary/30" 
                      : "hover:bg-muted/70 active:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg transition-colors",
                      active ? "bg-primary/20" : "bg-muted/50"
                    )}>
                      <Icon className={cn(
                        "h-4 w-4",
                        active ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <span className={cn(
                      "font-medium text-sm",
                      active ? "text-primary" : "text-foreground"
                    )}>
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight className={cn(
                    "h-4 w-4 transition-colors",
                    active ? "text-primary" : "text-muted-foreground/50"
                  )} />
                </Link>
              );
            })}
          </div>
        </ScrollArea>

        {/* Logout Button - Fixed at Bottom */}
        <div className="shrink-0 p-4 border-t border-border bg-background safe-area-bottom">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 w-full px-4 py-3.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 active:scale-[0.98] transition-all duration-200 border border-destructive/20"
          >
            <LogOut className="h-5 w-5 text-destructive" />
            <span className="font-semibold text-sm text-destructive">
              Sair do Sistema
            </span>
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default GuardianMenuDrawer;
