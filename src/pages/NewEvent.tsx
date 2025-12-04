import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, MapPin, Users, Trophy, Plus, Loader2 } from 'lucide-react';
import { useSports } from '@/hooks/useSports';
import { useTeachers } from '@/hooks/useTeachers';
import { useCreateEvent, useUpdateEvent, useEvent } from '@/hooks/useEvents';
import { Event } from '@/types';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';

// Configuração de timezone para Brasil
const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

// Dias da semana em português
const daysOfWeek = [
  { value: 'monday', label: 'Segunda-feira' },
  { value: 'tuesday', label: 'Terça-feira' },
  { value: 'wednesday', label: 'Quarta-feira' },
  { value: 'thursday', label: 'Quinta-feira' },
  { value: 'friday', label: 'Sexta-feira' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' }
];

// Função para formatar data no timezone do Brasil
const formatDateForBrazil = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: BRAZIL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date).split('/').reverse().join('-');
};

// Função para obter data atual no Brasil
const getCurrentDateBrazil = (): string => {
  const now = new Date();
  return formatDateForBrazil(now);
};

const NewEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const { data: sports = [], isLoading: sportsLoading } = useSports();
  const { data: teachers = [], isLoading: teachersLoading } = useTeachers();
  const { data: eventData, isLoading: eventLoading } = useEvent(id || '');
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: getCurrentDateBrazil(), // Data inicial com timezone do Brasil
    startTime: '',
    endTime: '',
    type: 'training' as 'training' | 'match' | 'evaluation' | 'meeting' | 'special' | 'inaugural',
    modalityId: '', // ID da modalidade
    teacherId: '', // ID do professor
    location: '',
    maxParticipants: '', // Limite de participantes
    isInaugural: false, // Flag para aula inaugural
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    daysOfWeek: [] as string[],
    students: []
  });

  // Carregar dados do evento para edição
  useEffect(() => {
    if (isEditMode && eventData) {
      setFormData({
        title: eventData.title || '',
        description: eventData.description || '',
        date: eventData.date || getCurrentDateBrazil(),
        startTime: eventData.startTime || '',
        endTime: eventData.endTime || '',
        type: eventData.type || 'training',
        modalityId: eventData.sport_id || '',
        teacherId: eventData.instructor_id || '',
        location: eventData.location || '',
        maxParticipants: '', // Será preenchido depois
        isInaugural: false, // Será preenchido depois
        frequency: 'daily',
        daysOfWeek: [],
        students: []
      });
    }
  }, [isEditMode, eventData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  // Filtrar professores por modalidade selecionada
  const filteredTeachers = useMemo(() => {
    if (!formData.modalityId || !sports.length || !teachers.length) return teachers;

    const selectedSport = sports.find(s => s.id === formData.modalityId);
    if (!selectedSport) return teachers;

    return teachers.filter(teacher =>
      teacher.modalitiesIds?.includes(formData.modalityId) ||
      teacher.fullName === selectedSport.instructor ||
      teacher.nickname === selectedSport.instructor
    );
  }, [formData.modalityId, sports, teachers]);

  // Gerar eventos recorrentes
  const generateRecurringEvents = () => {
    const events = [];
    const baseEvent = {
      title: formData.title,
      description: formData.description,
      startTime: formData.startTime,
      endTime: formData.endTime,
      type: formData.type,
      sport_id: formData.modalityId || null,
      instructor_id: formData.teacherId || null,
      location: formData.location,
      // Campos específicos do banco serão mapeados pelo hook
    };

    const startDate = new Date(formData.date + 'T00:00:00');

    if (formData.frequency === 'monthly') {
      // Eventos de segunda a sábado por 30 dias
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 30);

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        // Segunda (1) a Sábado (6)
        if (dayOfWeek >= 1 && dayOfWeek <= 6) {
          events.push({
            ...baseEvent,
            date: formatDateForBrazil(d)
          });
        }
      }
    } else if (formData.frequency === 'weekly') {
      // Eventos nos dias selecionados por 12 semanas
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 84); // 12 semanas

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[d.getDay()];

        if (formData.daysOfWeek.includes(dayName)) {
          events.push({
            ...baseEvent,
            date: formatDateForBrazil(d)
          });
        }
      }
    } else {
      // Evento único
      events.push({
        ...baseEvent,
        date: formData.date
      });
    }

    return events;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();


    // Validações
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime || !formData.location) {
      toast.error('Por favor, preencha todos os campos obrigatórios: Título, Data, Horários e Local.');
      return;
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formData.startTime) || !timeRegex.test(formData.endTime)) {
      toast.error('Por favor, informe horários válidos no formato HH:mm.');
      return;
    }

    if (!isEditMode && formData.frequency === 'weekly' && formData.daysOfWeek.length === 0) {
      toast.error('Selecione pelo menos um dia da semana para eventos semanais!');
      return;
    }

    // Validar data não pode ser no passado (apenas para novos eventos)
    if (!isEditMode) {
      const eventDate = new Date(formData.date + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (eventDate < today) {
        toast.error('A data do evento não pode ser no passado.');
        return;
      }
    }

    if (isEditMode) {
      // Modo edição - atualizar evento existente
      const updatedEvent = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        type: formData.type,
        sport_id: formData.modalityId || null,
        instructor_id: formData.teacherId || null,
        location: formData.location,
      };

      updateEventMutation.mutate(
        { id: id!, data: updatedEvent },
        {
          onSuccess: () => {
            toast.success('Evento editado com sucesso!', {
              description: 'Redirecionando para o calendário...',
              duration: 3000,
            });
            navigate('/calendar');
          },
          onError: (error: any) => {
            console.error('Erro ao editar evento:', error);
            toast.error(`Erro ao editar evento: ${error.message || 'Ocorreu um erro desconhecido.'}`);
          }
        }
      );
    } else {
      // Modo criação - criar novos eventos
      const eventsToCreate = generateRecurringEvents();

      const createPromises = eventsToCreate.map(event => {
        return new Promise((resolve, reject) => {
          createEventMutation.mutate(event, {
            onSuccess: resolve,
            onError: reject
          });
        });
      });

      Promise.all(createPromises)
        .then(() => {
          const message = eventsToCreate.length === 1
            ? 'Evento criado com sucesso!'
            : `${eventsToCreate.length} eventos criados com sucesso!`;

          toast.success(message, {
            description: 'Redirecionando para o calendário...',
            duration: 3000,
          });

          // Limpar formulário apenas no modo criação
          setFormData({
            title: '',
            description: '',
            date: getCurrentDateBrazil(),
            startTime: '',
            endTime: '',
            type: 'training',
            modalityId: '',
            teacherId: '',
            location: '',
            maxParticipants: '',
            isInaugural: false,
            frequency: 'daily',
            daysOfWeek: [],
            students: []
          });

          navigate('/calendar');
        })
        .catch((error: any) => {
          console.error('Erro ao criar eventos:', error);
          toast.error(`Erro ao criar evento(s): ${error.message || 'Ocorreu um erro desconhecido.'}`);
        });
    }
  };

  if (sportsLoading || teachersLoading || (isEditMode && eventLoading)) {
    return (
      <div className="space-y-6">
        <div className="text-center py-10">
          <Loader2 className="mx-auto h-10 w-10 animate-spin" />
          <p className="mt-3 text-muted-foreground">
            {isEditMode ? 'Carregando dados do evento...' : 'Carregando dados...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {isEditMode ? 'Editar Evento' : 'Criar Novo Evento'}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode
            ? 'Modifique as informações do evento conforme necessário'
            : 'Crie eventos únicos ou recorrentes para a academia'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Detalhes do Evento
          </CardTitle>
          <CardDescription>
            Preencha as informações do evento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Linha 1: Título e Tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Evento *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ex: Treino de Futebol, Aula Inaugural de Natação"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Evento *</Label>
                <Select value={formData.type} onValueChange={(value) => {
                  handleSelectChange('type', value);
                  handleInputChange('isInaugural', value === 'inaugural');
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="training">Treino</SelectItem>
                    <SelectItem value="match">Jogo/Partida</SelectItem>
                    <SelectItem value="evaluation">Avaliação</SelectItem>
                    <SelectItem value="meeting">Reunião</SelectItem>
                    <SelectItem value="special">Evento Especial</SelectItem>
                    <SelectItem value="inaugural">Aula Inaugural</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva detalhes do evento..."
                rows={3}
              />
            </div>

            {/* Linha 2: Data e Horários */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  min={getCurrentDateBrazil()}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Horário de Início *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Horário de Término *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Linha 3: Modalidade e Professor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modalityId">Modalidade</Label>
                <Select value={formData.modalityId} onValueChange={(value) => {
                  handleSelectChange('modalityId', value);
                  // Limpar professor selecionado quando modalidade muda
                  handleSelectChange('teacherId', '');
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma modalidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.map(sport => (
                      <SelectItem key={sport.id} value={sport.id}>
                        {sport.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacherId">Professor/Instrutor</Label>
                <Select value={formData.teacherId} onValueChange={(value) => handleSelectChange('teacherId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um professor" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTeachers.map(teacher => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.fullName} {teacher.nickname ? `(${teacher.nickname})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Linha 4: Local e Participantes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Local *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Ex: Campo Principal, Quadra de Futsal, Sala de Reuniões"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Limite de Participantes</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                  placeholder="Deixe vazio para ilimitado"
                  min="1"
                />
              </div>
            </div>

            {/* Sistema de Frequência - apenas para novos eventos */}
            {!isEditMode && (
              <div className="space-y-4">
                <Label>Frequência do Evento</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.frequency === 'daily'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleSelectChange('frequency', 'daily')}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="frequency"
                      value="daily"
                      checked={formData.frequency === 'daily'}
                      onChange={() => handleSelectChange('frequency', 'daily')}
                      className="rounded"
                    />
                    <div>
                      <p className="font-medium">Evento Único</p>
                      <p className="text-sm text-muted-foreground">Apenas no dia selecionado</p>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.frequency === 'weekly'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleSelectChange('frequency', 'weekly')}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="frequency"
                      value="weekly"
                      checked={formData.frequency === 'weekly'}
                      onChange={() => handleSelectChange('frequency', 'weekly')}
                      className="rounded"
                    />
                    <div>
                      <p className="font-medium">Semanal</p>
                      <p className="text-sm text-muted-foreground">Repetir nos dias selecionados</p>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.frequency === 'monthly'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleSelectChange('frequency', 'monthly')}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="frequency"
                      value="monthly"
                      checked={formData.frequency === 'monthly'}
                      onChange={() => handleSelectChange('frequency', 'monthly')}
                      className="rounded"
                    />
                    <div>
                      <p className="font-medium">Mensal</p>
                      <p className="text-sm text-muted-foreground">Seg-Sáb por 30 dias</p>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            )}

            {/* Seleção de dias para eventos semanais */}
            {formData.frequency === 'weekly' && (
              <div className="space-y-3">
                <Label>Dias da Semana</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {daysOfWeek.map(day => (
                    <label
                      key={day.value}
                      className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.daysOfWeek.includes(day.value)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.daysOfWeek.includes(day.value)}
                        onChange={() => handleDayToggle(day.value)}
                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                      />
                      <span className="text-sm font-medium">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Informação para eventos mensais */}
            {formData.frequency === 'monthly' && (
              <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
                <p className="text-sm text-info">
                  <strong>Eventos mensais:</strong> Serão criados eventos diários de segunda a sábado
                  por 30 dias a partir da data selecionada, excluindo domingos.
                </p>
              </div>
            )}

            {/* Alert para aulas inaugurais */}
            {(formData.type === 'inaugural' || formData.isInaugural) && (
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-sm text-warning">
                  <strong>Aula Inaugural:</strong> Este evento aparecerá como opção para agendamento
                  na página de cadastro de aula inaugural dos usuários.
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/calendar')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isEditMode ? updateEventMutation.isPending : createEventMutation.isPending}
              >
                {isEditMode ? (
                  updateEventMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )
                ) : (
                  createEventMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Evento{formData.frequency !== 'daily' ? 's' : ''}
                    </>
                  )
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewEvent;