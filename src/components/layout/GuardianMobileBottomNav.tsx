import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, CreditCard, Calendar, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuardianMobileBottomNavProps {
  onMenuClick: () => void;
}

const navItems = [
  { path: '/guardian', label: 'Início', icon: Home, exact: true },
  { path: '/guardian/student', label: 'Aluno', icon: User },
  { path: '/guardian/payments', label: 'Pagar', icon: CreditCard },
  { path: '/guardian/calendar', label: 'Agenda', icon: Calendar },
];

const GuardianMobileBottomNav: React.FC<GuardianMobileBottomNavProps> = ({ onMenuClick }) => {
  const location = useLocation();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.path, item.exact);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all duration-300",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground active:scale-95"
              )}
            >
              {active && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
              )}
              
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                active 
                  ? "bg-primary/15 scale-110" 
                  : "hover:bg-muted active:bg-muted"
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-300",
                  active && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all duration-300",
                active ? "text-primary font-semibold" : ""
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
        
        <button
          onClick={onMenuClick}
          className="relative flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-muted-foreground transition-all duration-300 active:scale-95"
        >
          <div className="p-2 rounded-xl hover:bg-muted active:bg-muted transition-all duration-300">
            <Menu className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </div>
    </nav>
  );
};

export default GuardianMobileBottomNav;
