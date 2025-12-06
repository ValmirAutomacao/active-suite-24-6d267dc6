import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, DollarSign, Calendar, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  onMenuClick: () => void;
}

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/students', label: 'Alunos', icon: Users },
  { path: '/financial', label: 'Financeiro', icon: DollarSign },
  { path: '/calendar', label: 'Agenda', icon: Calendar },
];

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onMenuClick }) => {
  const location = useLocation();

  return (
    <nav className="bottom-nav-fixed bg-card/95 backdrop-blur-lg border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all duration-300",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground active:scale-95"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
              )}
              
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-primary/15 scale-110" 
                  : "hover:bg-muted active:bg-muted"
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isActive && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all duration-300",
                isActive ? "text-primary font-semibold" : ""
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

export default MobileBottomNav;