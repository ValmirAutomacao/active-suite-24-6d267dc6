import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Check, User, Calendar, Dumbbell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StudentData {
  name: string;
  birthDate: string;
  guardianPhone: string;
}

interface ModalityOption {
  id: string;
  name: string;
  description: string | null;
}

interface EventOption {
  event_id: string;
  event_title: string;
  event_date: string;
  event_start_time: string;
  event_end_time: string;
  modality_name: string;
  available_spots: number;
}

const InauguralPreRegister: React.FC = () => {
  const navigate = useNavigate();
  const { profile, user, updateProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Step 1: Dados básicos
  const [studentData, setStudentData] = useState<StudentData>({
    name: '',
    birthDate: '',
    guardianPhone: ''
  });
  
  // Step 2: Seleção de modalidade e evento
  const [modalities, setModalities] = useState<ModalityOption[]>([]);
  const [selectedModality, setSelectedModality] = useState('');
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Calcular idade baseada na data de nascimento
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Carregar modalidades
  useEffect(() => {
    const fetchModalities = async () => {
      const { data, error } = await supabase
        .from('sports')
        .select('id, name, description')
        .eq('status', 'active');
      
      if (!error && data) {
        setModalities(data);
      }
    };
    fetchModalities();
  }, []);

  // Carregar eventos quando idade for calculada
  useEffect(() => {
    const fetchEvents = async () => {
      if (!studentData.birthDate) return;
      
      const age = calculateAge(studentData.birthDate);
      if (age < 3 || age > 18) return;

      setLoadingEvents(true);
      try {
        const { data, error } = await supabase.rpc('get_inaugural_events', {
          student_age: age
        });

        if (!error && data) {
          setEvents(data);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [studentData.birthDate]);

  const handleNext = () => {
    if (step === 1) {
      if (!studentData.name || !studentData.birthDate || !studentData.guardianPhone) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }
      const age = calculateAge(studentData.birthDate);
      if (age < 3 || age > 18) {
        toast.error('Idade do aluno deve estar entre 3 e 18 anos');
        return;
      }
    }
    if (step === 2) {
      if (!selectedModality || !selectedEvent) {
        toast.error('Selecione a modalidade e o horário da aula');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 1) {
      navigate('/guardian');
    } else {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // 1. Criar aluno provisório
      const { data: studentResult, error: studentError } = await supabase
        .from('students')
        .insert({
          name: studentData.name,
          birthDate: studentData.birthDate,
          cpf: '000.000.000-00', // Provisório
          enrollmentDate: new Date().toISOString().split('T')[0],
          status: 'provisional',
          guardian: {
            name: profile?.full_name || '',
            email: user?.email || '',
            phone: studentData.guardianPhone
          }
        })
        .select()
        .single();

      if (studentError) throw studentError;

      // 2. Registrar na aula inaugural
      const selectedEventData = events.find(e => e.event_id === selectedEvent);
      
      const { error: inauguralError } = await supabase
        .from('inaugural_classes')
        .insert({
          student_id: studentResult.id,
          selected_modality_id: selectedModality,
          selected_date: selectedEventData?.event_date,
          selected_time: selectedEventData?.event_start_time,
          event_id: selectedEvent,
          status: 'scheduled'
        });

      if (inauguralError) throw inauguralError;

      // 3. Registrar participação no evento
      await supabase.rpc('register_student_inaugural_event', {
        p_student_id: studentResult.id,
        p_event_id: selectedEvent
      });

      // 4. Atualizar profile como onboarding completed
      await updateProfile({ onboarding_completed: true });

      toast.success('Aula inaugural agendada com sucesso!');
      navigate('/guardian/inaugural-dashboard');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Erro ao agendar aula inaugural');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedEventData = events.find(e => e.event_id === selectedEvent);
  const selectedModalityData = modalities.find(m => m.id === selectedModality);

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              s === step 
                ? 'bg-primary text-primary-foreground' 
                : s < step 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-muted text-muted-foreground'
            }`}>
              {s < step ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 3 && (
              <div className={`w-12 h-1 mx-1 rounded ${s < step ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Dados Básicos */}
      {step === 1 && (
        <Card className="border-2">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <User className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Dados do Aluno</CardTitle>
            <p className="text-sm text-muted-foreground">
              Informe os dados básicos do aluno
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome completo do aluno *</Label>
              <Input
                id="name"
                value={studentData.name}
                onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
                placeholder="Nome do aluno"
              />
            </div>
            <div>
              <Label htmlFor="birthDate">Data de nascimento *</Label>
              <Input
                id="birthDate"
                type="date"
                value={studentData.birthDate}
                onChange={(e) => setStudentData({ ...studentData, birthDate: e.target.value })}
              />
              {studentData.birthDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Idade: {calculateAge(studentData.birthDate)} anos
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Telefone do responsável *</Label>
              <Input
                id="phone"
                type="tel"
                value={studentData.guardianPhone}
                onChange={(e) => setStudentData({ ...studentData, guardianPhone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Seleção de Aula */}
      {step === 2 && (
        <Card className="border-2">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Dumbbell className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Escolha a Aula</CardTitle>
            <p className="text-sm text-muted-foreground">
              Selecione a modalidade e o horário
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Modalidade *</Label>
              <Select value={selectedModality} onValueChange={setSelectedModality}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a modalidade" />
                </SelectTrigger>
                <SelectContent>
                  {modalities.map((mod) => (
                    <SelectItem key={mod.id} value={mod.id}>
                      {mod.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Data e Horário *</Label>
              {loadingEvents ? (
                <div className="text-center py-4 text-muted-foreground">
                  Carregando horários disponíveis...
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Nenhum horário disponível para a idade informada
                </div>
              ) : (
                <div className="space-y-2 mt-2">
                  {events
                    .filter(e => !selectedModality || modalities.find(m => m.id === selectedModality)?.name === e.modality_name)
                    .map((event) => (
                      <div
                        key={event.event_id}
                        onClick={() => setSelectedEvent(event.event_id)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedEvent === event.event_id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{event.modality_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(event.event_date).toLocaleDateString('pt-BR')} às {event.event_start_time.slice(0, 5)}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {event.available_spots} vagas
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirmação */}
      {step === 3 && (
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Confirmar Agendamento</CardTitle>
            <p className="text-sm text-muted-foreground">
              Revise os dados antes de confirmar
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Aluno</p>
                <p className="font-medium">{studentData.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Idade</p>
                <p className="font-medium">{calculateAge(studentData.birthDate)} anos</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Modalidade</p>
                <p className="font-medium">{selectedModalityData?.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Data e Horário</p>
                <p className="font-medium">
                  {selectedEventData && (
                    <>
                      {new Date(selectedEventData.event_date).toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })} às {selectedEventData.event_start_time.slice(0, 5)}
                    </>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Telefone de contato</p>
                <p className="font-medium">{studentData.guardianPhone}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex-1"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        {step < 3 ? (
          <Button onClick={handleNext} className="flex-1">
            Próximo
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit} 
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? 'Agendando...' : 'Confirmar Agendamento'}
            <Check className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default InauguralPreRegister;
