import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Shield } from 'lucide-react';
import { mockRoles } from '@/data/mockRoles';
import { Role } from '@/types';
import { toast } from 'sonner';

const availablePermissions = [
  { id: 'read', name: 'Visualizar', description: 'Visualizar dados do sistema' },
  { id: 'write', name: 'Editar', description: 'Criar e editar registros' },
  { id: 'delete', name: 'Excluir', description: 'Excluir registros' },
  { id: 'manage_users', name: 'Gerenciar Usuários', description: 'Gerenciar funcionários e professores' },
  { id: 'financial', name: 'Financeiro', description: 'Acessar módulo financeiro' },
  { id: 'reports', name: 'Relatórios', description: 'Gerar e visualizar relatórios' },
  { id: 'manage_students', name: 'Gerenciar Alunos', description: 'Cadastrar e gerenciar alunos' },
  { id: 'enrollment', name: 'Matrículas', description: 'Realizar matrículas' },
  { id: 'calendar', name: 'Agenda', description: 'Acessar agenda e eventos' },
  { id: 'students_view', name: 'Visualizar Alunos', description: 'Apenas visualizar dados dos alunos' },
  { id: 'payments', name: 'Pagamentos', description: 'Gerenciar pagamentos' }
];

const Roles: React.FC = () => {
  const [roles, setRoles] = useState(mockRoles);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const roleData: Role = {
      id: editingRole?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      permissions: formData.permissions
    };

    if (editingRole) {
      setRoles(prev => prev.map(r => r.id === editingRole.id ? roleData : r));
      toast.success('Função atualizada com sucesso!');
    } else {
      setRoles(prev => [...prev, roleData]);
      toast.success('Função cadastrada com sucesso!');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: []
    });
    setEditingRole(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setRoles(prev => prev.filter(r => r.id !== id));
    toast.success('Função removida com sucesso!');
  };

  const getPermissionName = (permissionId: string) => {
    const permission = availablePermissions.find(p => p.id === permissionId);
    return permission?.name || permissionId;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Funções</h1>
          <p className="text-muted-foreground">Gerencie as funções e permissões do sistema</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Função
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRole ? 'Editar Função' : 'Nova Função'}</DialogTitle>
              <DialogDescription>
                Configure o nome, descrição e permissões da função
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Função</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Recepcionista"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descreva as responsabilidades desta função"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Permissões</Label>
                <div className="grid grid-cols-1 gap-3">
                  {availablePermissions.map(permission => (
                    <div key={permission.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <input
                        type="checkbox"
                        id={`permission-${permission.id}`}
                        checked={formData.permissions.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        className="mt-1 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <label htmlFor={`permission-${permission.id}`} className="text-sm font-medium">
                          {permission.name}
                        </label>
                        <p className="text-xs text-muted-foreground">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingRole ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Lista de Funções
          </CardTitle>
          <CardDescription>
            {roles.length} função(ões) cadastrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Função</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Permissões</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map(role => (
                <TableRow key={role.id}>
                  <TableCell>
                    <p className="font-medium">{role.name}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map(permissionId => (
                        <Badge key={permissionId} variant="secondary" className="text-xs">
                          {getPermissionName(permissionId)}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(role)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(role.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Roles;