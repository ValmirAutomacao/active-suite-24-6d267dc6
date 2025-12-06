import React from 'react';
import { Link } from 'react-router-dom';
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
  X
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface MobileMenuDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const menuSections = [
  {
    title: 'Gestão',
    items: [
      { path: '/students', label: 'Alunos', icon: GraduationCap },
      { path: '/students/new', label: 'Novo Aluno', icon: UserPlus },
      { path: '/teachers', label: 'Professores', icon: UserCog },
      { path: '/modalities', label: 'Modalidades', icon: Dumbbell },
    ]
  },
  {
    title: 'Eventos',
    items: [
      { path: '/calendar', label: 'Agenda', icon: CalendarPlus },
      { path: '/events/new', label: 'Novo Evento', icon: CalendarPlus },
      { path: '/inaugural-class', label: 'Aula Inaugural', icon: GraduationCap },
    ]
  },
  {
    title: 'Administrativo',
    items: [
      { path: '/financial', label: 'Financeiro', icon: FileText },
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
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="flex items-center justify-between border-b pb-4">
          <DrawerTitle className="text-lg font-semibold">Menu</DrawerTitle>
          <button 
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </DrawerHeader>
        
        <ScrollArea className="flex-1 px-4 py-2">
          {menuSections.map((section, sectionIndex) => (
            <div key={section.title} className="mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              {sectionIndex < menuSections.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileMenuDrawer;
