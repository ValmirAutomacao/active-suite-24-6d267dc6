import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, Trophy, Clock, Users, DollarSign } from 'lucide-react';
import { Sport } from '@/types';
import { toast } from 'sonner';
import { useSports, useCreateSport, useUpdateSport, useDeleteSport } from '@/hooks/useSports';
import { Loader2 } from 'lucide-react';

const daysOfWeek = [
  { value: 'monday', label: 'Segunda' },
  { value: 'tuesday', label: 'Terça' },
  { value: 'wednesday', label: 'Quarta' },
  { value: 'thursday', label: 'Quinta' },
  { value: 'friday', label: 'Sexta' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' }
];

const Modalities: React.FC = () => {
  const { data: sports = [], isLoading, isError, refetch } = useSports();
  const createSportMutation = useCreateSport();
  const updateSportMutation = useUpdateSport();
  const deleteSportMutation = useDeleteSport();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<Sport | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ageMin: '0',
    ageMax: '0',
    monthlyFee: '0',
    weeklyHours: '0',
    maxStudents: '0',
    schedule: [{ day: 'monday', startTime: '', endTime: '' }]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addScheduleSlot = () => {
    setFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, { day: 'monday', startTime: '', endTime: '' }]
    }));
  };

  const removeScheduleSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação dos campos obrigatórios
    if (!formData.name || !formData.description) {
      toast.error('Nome e descrição são campos obrigatórios!');
      return;
    }
    
    // Verificar campos numéricos obrigatórios
    const ageMin = parseInt(formData.ageMin);
    const ageMax = parseInt(formData.ageMax);
    const weeklyHours = parseInt(formData.weeklyHours);
    const maxStudents = parseInt(formData.maxStudents);
    const monthlyFee = parseFloat(formData.monthlyFee);
    
    if (isNaN(ageMin) || isNaN(ageMax) || isNaN(weeklyHours) || isNaN(maxStudents) || isNaN(monthlyFee)) {
      toast.error('Por favor, preencha todos os campos numéricos corretamente!');
      return;
    }
    
    const sportData: Omit<Sport, 'id' | 'currentStudents' | 'created_at' | 'updated_at'> = {
      name: formData.name,
      description: formData.description,
      ageRange: {
        min: ageMin,
        max: ageMax
      },
      monthlyFee: monthlyFee,
      weeklyHours: weeklyHours,
      maxStudents: maxStudents,
      status: 'active',
      schedule: formData.schedule.filter(s => s.startTime && s.endTime).map(s => ({
        day: s.day as any,
        startTime: s.startTime,
        endTime: s.endTime
      }))
    };

    try {
      if (editingSport) {
        await updateSportMutation.mutateAsync({ id: editingSport.id, data: sportData });
        toast.success('Modalidade atualizada com sucesso!');
      } else {
        await createSportMutation.mutateAsync(sportData);
        toast.success('Modalidade cadastrada com sucesso!');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving sport:', error);
      toast.error('Erro ao salvar modalidade: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      ageMin: '0',
      ageMax: '0',
      monthlyFee: '0',
      weeklyHours: '0',
      maxStudents: '0',
      schedule: [{ day: 'monday', startTime: '', endTime: '' }]
    });
    setEditingSport(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (sport: Sport) => {
    setEditingSport(sport);
    setFormData({
      name: sport.name,
      description: sport.description,
      ageMin: sport.ageRange?.min?.toString() || '0',
      ageMax: sport.ageRange?.max?.toString() || '0',
      monthlyFee: sport.monthlyFee?.toString() || '0',
      weeklyHours: sport.weeklyHours?.toString() || '0',
      maxStudents: sport.maxStudents?.toString() || '0',
      schedule: sport.schedule.map(s => ({
        day: s.day,
        startTime: s.startTime,
        endTime: s.endTime
      }))
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta modalidade? Esta ação não pode ser desfeita.')) {
      try {
        await deleteSportMutation.mutateAsync(id);
        toast.success('Modalidade removida com sucesso!');
      } catch (error) {
        console.error('Error deleting sport:', error);
        toast.error('Erro ao remover modalidade: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Modalidades</h1>
          <p className="text-muted-foreground">Gerencie as modalidades esportivas da academia</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} disabled={createSportMutation.isPending || updateSportMutation.isPending}>
              {createSportMutation.isPending || updateSportMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingSport ? 'Atualizando...' : 'Cadastrando...'}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Modalidade
                </>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSport ? 'Editar Modalidade' : 'Nova Modalidade'}</DialogTitle>
              <DialogDescription>
                Preencha os dados da modalidade esportiva
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Modalidade</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ageMin">Idade Mínima</Label>
                  <Input
                    id="ageMin"
                    name="ageMin"
                    type="number"
                    value={formData.ageMin}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ageMax">Idade Máxima</Label>
                  <Input
                    id="ageMax"
                    name="ageMax"
                    type="number"
                    value={formData.ageMax}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyFee">Mensalidade (R$)</Label>
                  <Input
                    id="monthlyFee"
                    name="monthlyFee"
                    type="number"
                    step="0.01"
                    value={formData.monthlyFee}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxStudents">Máximo de Alunos</Label>
                  <Input
                    id="maxStudents"
                    name="maxStudents"
                    type="number"
                    value={formData.maxStudents}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Horários das Aulas</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addScheduleSlot}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Horário
                  </Button>
                </div>
                
                {formData.schedule.map((schedule, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-border rounded-lg">
                    <div className="space-y-2">
                      <Label>Dia da Semana</Label>
                      <Select 
                        value={schedule.day} 
                        onValueChange={(value) => handleScheduleChange(index, 'day', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {daysOfWeek.map(day => (
                            <SelectItem key={day.value} value={day.value}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Hora de Início</Label>
                      <Input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hora de Término</Label>
                      <Input
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex items-end">
                      {formData.schedule.length > 1 && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeScheduleSlot(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  disabled={createSportMutation.isPending || updateSportMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createSportMutation.isPending || updateSportMutation.isPending}
                >
                  {createSportMutation.isPending || updateSportMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingSport ? 'Atualizando...' : 'Cadastrando...'}
                    </>
                  ) : (
                    editingSport ? 'Atualizar' : 'Cadastrar'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Carregando modalidades...</span>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-destructive text-lg mb-2">Erro ao carregar as modalidades</p>
          <p className="text-muted-foreground mb-4">Verifique sua conexão e tente novamente</p>
          <Button onClick={() => refetch()}>Tentar novamente</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sports.map(sport => (
            <Card key={sport.id} className="hover:shadow-academy-glow transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  {sport.name}
                </CardTitle>
                <CardDescription>{sport.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{sport.currentStudents || 0}/{sport.maxStudents || 0} alunos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{sport.weeklyHours || 0}h/semana</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>R$ {(sport.monthlyFee || 0).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Idade: </span>
                    <span>{sport.ageRange?.min || 0}-{sport.ageRange?.max || 0} anos</span>
                  </div>
                </div>
                


                <div>
                  <p className="text-sm font-medium mb-2">Horários:</p>
                  <div className="space-y-1">
                    {sport.schedule.map((schedule, index) => (
                      <div key={index} className="text-xs text-muted-foreground">
                        {daysOfWeek.find(d => d.value === schedule.day)?.label}: {schedule.startTime} - {schedule.endTime}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleEdit(sport)} 
                    className="flex-1"
                    disabled={deleteSportMutation.isPending}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDelete(sport.id)}
                    disabled={deleteSportMutation.isPending}
                  >
                    {deleteSportMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Modalities;