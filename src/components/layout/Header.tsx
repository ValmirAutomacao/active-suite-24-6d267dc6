import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, DollarSign, Calendar, Users, UserPlus, Trophy, Menu } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/financial', label: 'Financeiro', icon: DollarSign },
    { path: '/calendar', label: 'Agenda', icon: Calendar },
    { path: '/students', label: 'Alunos', icon: Users },
    { path: '/enrollment', label: 'Matrícula', icon: UserPlus }
  ];
  
  return (
    <header className="bg-background border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/assets/logo.png"
              alt="Logo da Academia"
              className="h-10 w-auto object-contain"
              onError={(e) => {
                // Fallback para o ícone padrão se a imagem não carregar
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling.style.display = 'flex';
              }}
            />
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-academy-glow" style={{display: 'none'}}>
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">AcademyManager</span>
          </Link>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {menuItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-primary text-primary-foreground shadow-academy-glow'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Menu Mobile */}
          <div className="md:hidden">
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;