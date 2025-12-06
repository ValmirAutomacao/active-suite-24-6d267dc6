import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { 
  GraduationCap,
  FileText,
  Megaphone,
  UserCog,
  Briefcase,
  Dumbbell,
  BarChart3,
  CalendarPlus,
  UserPlus,
  LogOut,
  ChevronRight,
  X,
  Home,
  DollarSign,
  Calendar,
  Users,
  ClipboardList
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface MobileMenuDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const menuSections = [
  {
    title: 'Gestão',
    items: [
      { path: '/', label: 'Dashboard', icon: Home },
      { path: '/students', label: 'Alunos', icon: Users },
      { path: '/students/new', label: 'Novo Aluno', icon: UserPlus },
      { path: '/teachers', label: 'Professores', icon: UserCog },
      { path: '/modalities', label: 'Modalidades', icon: Dumbbell },
    ]
  },
  {
    title: 'Eventos',
    items: [
      { path: '/calendar', label: 'Agenda', icon: Calendar },
      { path: '/events/new', label: 'Novo Evento', icon: CalendarPlus },
      { path: '/inaugural-class', label: 'Aula Inaugural', icon: GraduationCap },
      { path: '/enrollment', label: 'Matrículas', icon: ClipboardList },
    ]
  },
  {
    title: 'Administrativo',
    items: [
      { path: '/financial', label: 'Financeiro', icon: DollarSign },
      { path: '/nfs-e', label: 'Notas Fiscais', icon: FileText },
      { path: '/reports', label: 'Relatórios', icon: BarChart3 },
    ]
  },
  {
    title: 'Configurações',
    items: [
      { path: '/roles', label: 'Funções', icon: Briefcase },
      { path: '/employees', label: 'Funcionários', icon: UserCog },
      { path: '/marketing', label: 'Marketing', icon: Megaphone },
    ]
  }
];

const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({ open, onOpenChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] bg-background flex flex-col">
        {/* Header with app branding */}
        <DrawerHeader className="flex items-center justify-between border-b border-border pb-4 px-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <img src="/favicon.ico" alt="Logo" className="w-6 h-6" />
            </div>
            <div>
              <DrawerTitle className="text-lg font-bold text-foreground">Bayer Academy</DrawerTitle>
              <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
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
          {menuSections.map((section, sectionIndex) => (
            <div key={section.title} className="mb-5">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => onOpenChange(false)}
                      className={cn(
                        "flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 active:scale-[0.98]",
                        isActive 
                          ? "bg-primary/15 border border-primary/30" 
                          : "hover:bg-muted/70 active:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg transition-colors",
                          isActive ? "bg-primary/20" : "bg-muted/50"
                        )}>
                          <Icon className={cn(
                            "h-4 w-4",
                            isActive ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                        <span className={cn(
                          "font-medium text-sm",
                          isActive ? "text-primary" : "text-foreground"
                        )}>
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight className={cn(
                        "h-4 w-4 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground/50"
                      )} />
                    </Link>
                  );
                })}
              </div>
              {sectionIndex < menuSections.length - 1 && (
                <Separator className="mt-3 bg-border/50" />
              )}
            </div>
          ))}
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

export default MobileMenuDrawer;