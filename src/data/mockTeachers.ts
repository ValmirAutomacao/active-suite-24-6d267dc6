import { Teacher } from '../types';

export const mockTeachers: Teacher[] = [
  {
    id: '1',
    fullName: 'Carlos Roberto Silva',
    nickname: 'Professor Carlos',
    identity: '12.345.678-9',
    cpf: '123.456.789-00',
    education: 'Educação Física - UNIFESP',
    specialization: 'Futebol Infantil e Juvenil',
    age: 35,
    gender: 'male',
    phone: '(11) 99999-1111',
    email: 'carlos.silva@academy.com',
    address: 'Rua das Flores, 123 - São Paulo/SP',
    modalitiesIds: ['1', '2', '3'],
    status: 'active',
    hireDate: '2022-01-15',
    salary: 4500.00
  },
  {
    id: '2',
    fullName: 'Ana Paula Fernandes',
    nickname: 'Professora Ana',
    identity: '98.765.432-1',
    cpf: '987.654.321-00',
    education: 'Educação Física - USP',
    specialization: 'Futebol Feminino e Iniciação Esportiva',
    age: 29,
    gender: 'female',
    phone: '(11) 99999-2222',
    email: 'ana.fernandes@academy.com',
    address: 'Av. Paulista, 456 - São Paulo/SP',
    modalitiesIds: ['1', '4', '5'],
    status: 'active',
    hireDate: '2022-03-10',
    salary: 4200.00
  },
  {
    id: '3',
    fullName: 'Roberto Lima Santos',
    nickname: 'Professor Beto',
    identity: '11.222.333-4',
    cpf: '111.222.333-44',
    education: 'Educação Física - UNINOVE',
    specialization: 'Futebol de Base e Preparação Física',
    age: 42,
    gender: 'male',
    phone: '(11) 99999-3333',
    email: 'roberto.santos@academy.com',
    address: 'Rua do Esporte, 789 - São Paulo/SP',
    modalitiesIds: ['2', '3', '4', '5'],
    status: 'active',
    hireDate: '2021-08-20',
    salary: 5000.00
  }
];