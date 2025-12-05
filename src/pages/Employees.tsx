import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Users, Loader2 } from 'lucide-react';
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from '@/hooks/useEmployees';
import { useRoles } from '@/hooks/useRoles';
import { toast } from 'sonner';

const Employees: React.FC = () => {
  const { data: employees = [], isLoading, isError } = useEmployees();
  const { data: roles = [] } = useRoles();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role_id: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingEmployee) {
        await updateEmployee.mutateAsync({
          id: editingEmployee.id,
          data: {
            full_name: formData.full_name,
            email: formData.email,
            role_id: formData.role_id || null
          }
        });
        toast.success('Funcionário atualizado com sucesso!');
      } else {
        await createEmployee.mutateAsync({
          full_name: formData.full_name,
          email: formData.email,
          role_id: formData.role_id || null,
          status: 'active'
        });
        toast.success('Funcionário cadastrado com sucesso!');
      }
      resetForm();
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      role_id: ''
    });
    setEditingEmployee(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee);
    setFormData({
      full_name: employee.full_name,
      email: employee.email,
      role_id: employee.role_id || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEmployee.mutateAsync(id);
      toast.success('Funcionário removido com sucesso!');
    } catch (error: any) {
      toast.error(`Erro ao remover: ${error.message}`);
    }
  };

  const getRoleName = (roleId: string | null) => {
    if (!roleId) return 'Sem função';
    return roles.find(role => role.id === roleId)?.name || 'Função não encontrada';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive">Erro ao carregar funcionários</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Funcionários</h1>
          <p className="text-muted-foreground">Gerencie os funcionários da academia</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}</DialogTitle>
              <DialogDescription>
                Preencha os dados do funcionário
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="role_id">Função</Label>
                  <Select value={formData.role_id} onValueChange={(value) => setFormData(prev => ({ ...prev, role_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createEmployee.isPending || updateEmployee.isPending}>
                  {(createEmployee.isPending || updateEmployee.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingEmployee ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Lista de Funcionários
          </CardTitle>
          <CardDescription>
            {employees.length} funcionário(s) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Nenhum funcionário cadastrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map(employee => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <p className="font-medium">{employee.full_name}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{employee.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getRoleName(employee.role_id)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                        {employee.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {employee.created_at ? new Date(employee.created_at).toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(employee)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDelete(employee.id)}
                          disabled={deleteEmployee.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Employees;
