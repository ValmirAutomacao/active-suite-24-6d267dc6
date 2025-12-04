import { Role } from '../types';

export const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Administrador',
    description: 'Acesso total ao sistema',
    permissions: ['read', 'write', 'delete', 'manage_users', 'financial', 'reports']
  },
  {
    id: '2',
    name: 'Gerente',
    description: 'Gerenciamento geral da academia',
    permissions: ['read', 'write', 'financial', 'reports', 'manage_students']
  },
  {
    id: '3',
    name: 'Recepcionista',
    description: 'Atendimento e cadastros básicos',
    permissions: ['read', 'write', 'manage_students', 'enrollment']
  },
  {
    id: '4',
    name: 'Professor',
    description: 'Acesso aos dados dos alunos e agenda',
    permissions: ['read', 'calendar', 'students_view']
  },
  {
    id: '5',
    name: 'Financeiro',
    description: 'Gestão financeira e pagamentos',
    permissions: ['read', 'financial', 'reports', 'payments']
  }
];