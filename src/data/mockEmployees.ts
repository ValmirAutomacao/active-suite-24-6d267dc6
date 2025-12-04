import { Employee } from '../types';

export const mockEmployees: Employee[] = [
  {
    id: '1',
    fullName: 'Administrador do Sistema',
    roleId: '1',
    login: 'admin',
    password: 'admin',
    status: 'active',
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    fullName: 'Maria Silva Santos',
    roleId: '2',
    login: 'maria.santos',
    password: '123456',
    status: 'active',
    createdAt: '2024-02-15'
  },
  {
    id: '3',
    fullName: 'João Carlos Oliveira',
    roleId: '3',
    login: 'joao.oliveira',
    password: '123456',
    status: 'active',
    createdAt: '2024-03-10'
  },
  {
    id: '4',
    fullName: 'Ana Paula Costa',
    roleId: '4',
    login: 'ana.costa',
    password: '123456',
    status: 'active',
    createdAt: '2024-04-05'
  }
];