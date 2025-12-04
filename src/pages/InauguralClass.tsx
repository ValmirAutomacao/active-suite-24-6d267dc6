import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User, Users, MapPin, Heart, Trophy, Calendar, ArrowRight } from 'lucide-react';
import { mockSports } from '@/data/mockSports';
import { mockEvents } from '@/data/mockEvents';
import { mockStudents } from '@/data/mockStudents';
import { Student, InauguralClass } from '@/types';
import { toast } from 'sonner';
import PhotoUpload from '@/components/shared/PhotoUpload';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import supabase from '@/lib/supabaseClient';

const InauguralClassPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [currentTab, setCurrentTab] = useState('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Dados Pessoais
    name: '',
    birthDate: '',
    cpf: '',
    photo: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    },
    // Dados do Responsável
    guardian: {
      name: '',
      cpf: '',
      phone: '',
      email: '',
      profession: ''
    },
    // Contatos de Emergência
    emergencyContacts: [
      { name: '', relationship: '', phone: '', email: '' }
    ],
    // Dados de Saúde
    healthInfo: {
      allergies: '',
      medications: '',
      restrictions: '',
      doctorContact: '',
      healthPlan: ''
    },
    // Dados da Aula Inaugural
    selectedDate: '',
    selectedModality: ''
  });

  const handleInputChange = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as any),
        [field]: value
      }
    }));
  };

  const handleDirectInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmergencyContactChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const addEmergencyContact = () => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, { name: '', relationship: '', phone: '', email: '' }]
    }));
  };

  const removeEmergencyContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
    }));
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getSuggestedModalities = () => {
    const age = calculateAge(formData.birthDate);
    return mockSports.filter(sport => 
      sport.name !== 'Aula Inaugural' &&
      age >= sport.ageRange.min && 
      age <= sport.ageRange.max
    );
  };

  // Obter datas disponíveis para aula inaugural (próximos sábados)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 8; i++) { // próximas 8 semanas
      const nextSaturday = new Date(today);
      nextSaturday.setDate(today.getDate() + ((6 - today.getDay()) % 7) + (i * 7));
      dates.push({
        value: nextSaturday.toISOString().split('T')[0],
        label: nextSaturday.toLocaleDateString('pt-BR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      });
    }
    return dates;
  };

  // Sugerir modalidade baseada na idade quando data de nascimento for preenchida
  React.useEffect(() => {
    if (formData.birthDate && !formData.selectedModality) {
      const suggestedModalities = getSuggestedModalities();
      if (suggestedModalities.length > 0) {
        setFormData(prev => ({ ...prev, selectedModality: suggestedModalities[0].id }));
      }
    }
  }, [formData.birthDate]);

  // Função para gerar UUID válido baseado no ID do sport
  const generateModalityUuid = (sportId: string) => {
    // Criar um UUID baseado no sportId, preenchendo com zeros
    const paddedId = sportId.padStart(8, '0');
    return `${paddedId}-0000-0000-0000-000000000000`;
  };

  const handleConfirmClass = async () => {
    if (!formData.name || !formData.birthDate || !formData.selectedDate || !formData.selectedModality) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }

    if (!user?.email) {
      toast.error('Usuário não encontrado. Faça login novamente.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Verificar se já existe aluno com o mesmo CPF (se CPF foi fornecido)
      if (formData.cpf) {
        const { data: existingStudent } = await supabase
          .from('students')
          .select('id')
          .eq('cpf', formData.cpf)
          .single();

        if (existingStudent) {
          throw new Error('Já existe um aluno cadastrado com este CPF.');
        }
      }

      // 2. Criar o aluno na tabela students com status provisional
      const studentData = {
        name: formData.name,
        birthDate: formData.birthDate,
        cpf: formData.cpf || `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`, // CPF único temporário
        photo: formData.photo || null,
        address: formData.address,
        guardian: {
          ...formData.guardian,
          email: user.email // Vincular com o email do responsável logado
        },
        emergencyContacts: formData.emergencyContacts,
        healthInfo: formData.healthInfo,
        enrolledSports: [generateModalityUuid(formData.selectedModality)],
        status: 'provisional', // Status provisório até finalizar matrícula
        enrollmentDate: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
        monthlyFee: 0, // Será definido após matrícula
        paymentStatus: 'pending',
        lastPayment: null,
      };

      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert([studentData])
        .select()
        .single();

      if (studentError) throw studentError;

      // 3. Criar registro da aula inaugural
      const { error: inauguralError } = await supabase
        .from('inaugural_classes')
        .insert([{
          student_id: student.id,
          selected_date: formData.selectedDate,
          selected_modality_id: generateModalityUuid(formData.selectedModality), // Converter para UUID válido
          status: 'scheduled',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (inauguralError) throw inauguralError;

      // 4. Atualizar o perfil do usuário para onboarding_completed: true
      const { error: profileError } = await updateProfile({
        onboarding_completed: true
      });

      if (profileError) throw profileError;

      toast.success('Aula inaugural confirmada com sucesso! Redirecionando para seu dashboard...');

      // 5. Redirecionar para o dashboard inaugural (será feito automaticamente pelo AuthContext)
      // O AuthContext detectará que onboarding_completed = true e redirecionará
      setTimeout(() => {
        navigate('/inaugural-dashboard', { replace: true });
      }, 1500);

    } catch (error: any) {
      console.error('Erro ao confirmar aula inaugural:', error);
      toast.error(`Erro ao confirmar aula inaugural: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMatricula = () => {
    if (!formData.name || !formData.birthDate || !formData.selectedModality) {
      toast.error('Preencha todos os campos obrigatórios antes de continuar para matrícula!');
      return;
    }

    // Navegar para página de matrícula com dados preenchidos
    // Em uma implementação real, passaríamos os dados via context ou state management
    toast.success('Redirecionando para matrícula com dados preenchidos...');
    navigate('/enrollment', { state: { inauguralData: formData } });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      birthDate: '',
      cpf: '',
      photo: '',
      address: {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: ''
      },
      guardian: {
        name: '',
        cpf: '',
        phone: '',
        email: '',
        profession: ''
      },
      emergencyContacts: [
        { name: '', relationship: '', phone: '', email: '' }
      ],
      healthInfo: {
        allergies: '',
        medications: '',
        restrictions: '',
        doctorContact: '',
        healthPlan: ''
      },
      selectedDate: '',
      selectedModality: ''
    });
    setCurrentTab('personal');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Aula Inaugural</h1>
        <p className="text-muted-foreground">Cadastre-se para uma aula experimental gratuita</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Pessoais
              </TabsTrigger>
              <TabsTrigger value="guardian" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Responsável
              </TabsTrigger>
              <TabsTrigger value="address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Endereço
              </TabsTrigger>
              <TabsTrigger value="emergency" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Emergência & Saúde
              </TabsTrigger>
              <TabsTrigger value="inaugural" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Aula Inaugural
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleDirectInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de Nascimento *</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleDirectInputChange('birthDate', e.target.value)}
                      required
                    />
                    {formData.birthDate && (
                      <p className="text-sm text-muted-foreground">
                        Idade: {calculateAge(formData.birthDate)} anos
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => handleDirectInputChange('cpf', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <PhotoUpload
                    value={formData.photo}
                    onChange={(photo) => handleDirectInputChange('photo', photo)}
                    label="Foto do Aluno"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="guardian" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardianName">Nome do Responsável *</Label>
                  <Input
                    id="guardianName"
                    value={formData.guardian.name}
                    onChange={(e) => handleInputChange('guardian', 'name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianCpf">CPF do Responsável *</Label>
                  <Input
                    id="guardianCpf"
                    value={formData.guardian.cpf}
                    onChange={(e) => handleInputChange('guardian', 'cpf', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianPhone">Telefone *</Label>
                  <Input
                    id="guardianPhone"
                    value={formData.guardian.phone}
                    onChange={(e) => handleInputChange('guardian', 'phone', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianEmail">Email *</Label>
                  <Input
                    id="guardianEmail"
                    type="email"
                    value={formData.guardian.email}
                    onChange={(e) => handleInputChange('guardian', 'email', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="guardianProfession">Profissão</Label>
                  <Input
                    id="guardianProfession"
                    value={formData.guardian.profession}
                    onChange={(e) => handleInputChange('guardian', 'profession', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="address" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="street">Rua/Avenida *</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => handleInputChange('address', 'street', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">Número *</Label>
                  <Input
                    id="number"
                    value={formData.address.number}
                    onChange={(e) => handleInputChange('address', 'number', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={formData.address.complement}
                    onChange={(e) => handleInputChange('address', 'complement', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Input
                    id="neighborhood"
                    value={formData.address.neighborhood}
                    onChange={(e) => handleInputChange('address', 'neighborhood', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP *</Label>
                  <Input
                    id="zipCode"
                    value={formData.address.zipCode}
                    onChange={(e) => handleInputChange('address', 'zipCode', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado *</Label>
                  <Select value={formData.address.state} onValueChange={(value) => handleInputChange('address', 'state', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SP">São Paulo</SelectItem>
                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                      <SelectItem value="MG">Minas Gerais</SelectItem>
                      <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                      {/* Adicionar outros estados conforme necessário */}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="emergency" className="space-y-6 mt-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Contatos de Emergência</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addEmergencyContact}>
                      Adicionar Contato
                    </Button>
                  </div>
                  
                  {formData.emergencyContacts.map((contact, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border border-border rounded-lg">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input
                          value={contact.name}
                          onChange={(e) => handleEmergencyContactChange(index, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Parentesco</Label>
                        <Input
                          value={contact.relationship}
                          onChange={(e) => handleEmergencyContactChange(index, 'relationship', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Telefone</Label>
                        <Input
                          value={contact.phone}
                          onChange={(e) => handleEmergencyContactChange(index, 'phone', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <div className="flex gap-2">
                          <Input
                            type="email"
                            value={contact.email}
                            onChange={(e) => handleEmergencyContactChange(index, 'email', e.target.value)}
                          />
                          {formData.emergencyContacts.length > 1 && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeEmergencyContact(index)}
                            >
                              Remover
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Informações de Saúde</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="allergies">Alergias</Label>
                      <Textarea
                        id="allergies"
                        value={formData.healthInfo.allergies}
                        onChange={(e) => handleInputChange('healthInfo', 'allergies', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="medications">Medicamentos em Uso</Label>
                      <Textarea
                        id="medications"
                        value={formData.healthInfo.medications}
                        onChange={(e) => handleInputChange('healthInfo', 'medications', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="restrictions">Restrições Médicas</Label>
                      <Textarea
                        id="restrictions"
                        value={formData.healthInfo.restrictions}
                        onChange={(e) => handleInputChange('healthInfo', 'restrictions', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="healthPlan">Plano de Saúde</Label>
                      <Input
                        id="healthPlan"
                        value={formData.healthInfo.healthPlan}
                        onChange={(e) => handleInputChange('healthInfo', 'healthPlan', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="inaugural" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Datas Disponíveis
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Escolha o melhor dia para a aula inaugural (todos os sábados das 10h às 11h):
                    </p>
                    <div className="space-y-2">
                      {getAvailableDates().map(date => (
                        <div
                          key={date.value}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            formData.selectedDate === date.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => handleDirectInputChange('selectedDate', date.value)}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="selectedDate"
                              value={date.value}
                              checked={formData.selectedDate === date.value}
                              onChange={() => handleDirectInputChange('selectedDate', date.value)}
                              className="rounded"
                            />
                            <div>
                              <p className="font-medium capitalize">{date.label}</p>
                              <p className="text-sm text-muted-foreground">10:00 - 11:00</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Modalidades Disponíveis
                    </h3>
                    
                    {formData.birthDate && getSuggestedModalities().length > 0 && (
                      <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                        <p className="text-sm font-medium text-primary mb-1">
                          Modalidade sugerida para {calculateAge(formData.birthDate)} anos:
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Baseado na idade informada
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      {mockSports.filter(sport => sport.name !== 'Aula Inaugural').map(sport => {
                        const isRecommended = formData.birthDate && 
                          calculateAge(formData.birthDate) >= sport.ageRange.min && 
                          calculateAge(formData.birthDate) <= sport.ageRange.max;
                        
                        return (
                          <div
                            key={sport.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              formData.selectedModality === sport.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => handleDirectInputChange('selectedModality', sport.id)}
                          >
                            <div className="flex items-start space-x-3">
                              <input
                                type="radio"
                                name="selectedModality"
                                value={sport.id}
                                checked={formData.selectedModality === sport.id}
                                onChange={() => handleDirectInputChange('selectedModality', sport.id)}
                                className="rounded mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium">{sport.name}</p>
                                  {isRecommended && (
                                    <Badge variant="default" className="text-xs">
                                      Recomendado
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{sport.description}</p>
                                <div className="text-xs text-muted-foreground space-y-1">
                                  <p>Idade: {sport.ageRange.min}-{sport.ageRange.max} anos</p>
                                  <p>Professor: {sport.instructor}</p>
                                  <p>Carga horária: {sport.weeklyHours}h/semana</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {formData.selectedDate && formData.selectedModality && (
                <div className="mt-8 p-6 bg-success/10 border border-success/20 rounded-lg">
                  <h4 className="font-semibold text-success mb-3">Resumo da Aula Inaugural</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Data:</strong> {getAvailableDates().find(d => d.value === formData.selectedDate)?.label}</p>
                      <p><strong>Horário:</strong> 10:00 - 11:00</p>
                      <p><strong>Local:</strong> Campo Principal</p>
                    </div>
                    <div>
                      <p><strong>Modalidade:</strong> {mockSports.find(s => s.id === formData.selectedModality)?.name}</p>
                      <p><strong>Professor:</strong> Equipe Técnica</p>
                      <p><strong>Valor:</strong> Gratuito</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 mt-6">
                    <Button onClick={handleConfirmClass} className="flex-1" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Confirmando...
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4 mr-2" />
                          Confirmar Aula Inaugural
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleMatricula} className="flex-1">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Ir para Matrícula
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const tabs = ['personal', 'guardian', 'address', 'emergency', 'inaugural'];
                const currentIndex = tabs.indexOf(currentTab);
                if (currentIndex > 0) setCurrentTab(tabs[currentIndex - 1]);
              }}
              disabled={currentTab === 'personal'}
            >
              Anterior
            </Button>
            
            {currentTab !== 'inaugural' && (
              <Button
                onClick={() => {
                  const tabs = ['personal', 'guardian', 'address', 'emergency', 'inaugural'];
                  const currentIndex = tabs.indexOf(currentTab);
                  if (currentIndex < tabs.length - 1) setCurrentTab(tabs[currentIndex + 1]);
                }}
              >
                Próximo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InauguralClassPage;