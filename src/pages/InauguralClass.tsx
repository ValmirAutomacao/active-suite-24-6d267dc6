import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User, Users, MapPin, Heart, Trophy, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { useSports } from '@/hooks/useSports';
import { toast } from 'sonner';
import PhotoUpload from '@/components/shared/PhotoUpload';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const InauguralClassPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { data: sports = [], isLoading: sportsLoading } = useSports();
  
  const [currentTab, setCurrentTab] = useState('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
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
    return sports.filter(sport => 
      sport.name !== 'Aula Inaugural' &&
      age >= sport.ageRange.min && 
      age <= sport.ageRange.max
    );
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 8; i++) {
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

  React.useEffect(() => {
    if (formData.birthDate && !formData.selectedModality) {
      const suggestedModalities = getSuggestedModalities();
      if (suggestedModalities.length > 0) {
        setFormData(prev => ({ ...prev, selectedModality: suggestedModalities[0].id }));
      }
    }
  }, [formData.birthDate, sports]);

  const handleConfirmClass = async () => {
    if (!formData.name || !formData.birthDate || !formData.selectedDate || !formData.selectedModality) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }

    setIsSubmitting(true);

    try {
      if (formData.cpf) {
        const { data: existingStudent } = await supabase
          .from('students')
          .select('id')
          .eq('cpf', formData.cpf)
          .maybeSingle();

        if (existingStudent) {
          throw new Error('Já existe um aluno cadastrado com este CPF.');
        }
      }

      const studentData = {
        name: formData.name,
        birthDate: formData.birthDate,
        cpf: formData.cpf || `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        photo: formData.photo || null,
        address: formData.address,
        guardian: {
          ...formData.guardian,
          email: user?.email || formData.guardian.email
        },
        emergencyContacts: formData.emergencyContacts,
        healthInfo: formData.healthInfo,
        enrolledSports: [formData.selectedModality],
        status: 'provisional',
        enrollmentDate: new Date().toISOString().split('T')[0],
        monthlyFee: 0,
        paymentStatus: 'pending',
        lastPayment: null,
      };

      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert([studentData])
        .select()
        .single();

      if (studentError) throw studentError;

      const { error: inauguralError } = await supabase
        .from('inaugural_classes')
        .insert([{
          student_id: student.id,
          selected_date: formData.selectedDate,
          selected_modality_id: formData.selectedModality,
          status: 'scheduled',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (inauguralError) throw inauguralError;

      if (updateProfile) {
        await updateProfile({ onboarding_completed: true });
      }

      toast.success('Aula inaugural confirmada com sucesso!');
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

    toast.success('Redirecionando para matrícula com dados preenchidos...');
    navigate('/enrollment', { state: { inauguralData: formData } });
  };

  if (sportsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => handleDirectInputChange('cpf', e.target.value)}
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
                  <Label htmlFor="guardianCpf">CPF do Responsável</Label>
                  <Input
                    id="guardianCpf"
                    value={formData.guardian.cpf}
                    onChange={(e) => handleInputChange('guardian', 'cpf', e.target.value)}
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
                  <Label htmlFor="street">Rua/Avenida</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => handleInputChange('address', 'street', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={formData.address.number}
                    onChange={(e) => handleInputChange('address', 'number', e.target.value)}
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
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={formData.address.neighborhood}
                    onChange={(e) => handleInputChange('address', 'neighborhood', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    value={formData.address.zipCode}
                    onChange={(e) => handleInputChange('address', 'zipCode', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('address', 'state', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="emergency" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Contatos de Emergência</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addEmergencyContact}>
                    Adicionar Contato
                  </Button>
                </div>
                
                {formData.emergencyContacts.map((contact, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Contato {index + 1}</h4>
                      {index > 0 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeEmergencyContact(index)}>
                          Remover
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input
                          value={contact.name}
                          onChange={(e) => handleEmergencyContactChange(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Parentesco</Label>
                        <Input
                          value={contact.relationship}
                          onChange={(e) => handleEmergencyContactChange(index, 'relationship', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Telefone</Label>
                        <Input
                          value={contact.phone}
                          onChange={(e) => handleEmergencyContactChange(index, 'phone', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={contact.email}
                          onChange={(e) => handleEmergencyContactChange(index, 'email', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações de Saúde</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="allergies">Alergias</Label>
                    <Input
                      id="allergies"
                      value={formData.healthInfo.allergies}
                      onChange={(e) => handleInputChange('healthInfo', 'allergies', e.target.value)}
                      placeholder="Descreva alergias conhecidas"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medications">Medicamentos em Uso</Label>
                    <Input
                      id="medications"
                      value={formData.healthInfo.medications}
                      onChange={(e) => handleInputChange('healthInfo', 'medications', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="restrictions">Restrições</Label>
                    <Input
                      id="restrictions"
                      value={formData.healthInfo.restrictions}
                      onChange={(e) => handleInputChange('healthInfo', 'restrictions', e.target.value)}
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
            </TabsContent>

            <TabsContent value="inaugural" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Selecione a Data</h3>
                  <Select 
                    value={formData.selectedDate} 
                    onValueChange={(value) => handleDirectInputChange('selectedDate', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha uma data" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableDates().map(date => (
                        <SelectItem key={date.value} value={date.value}>
                          {date.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Selecione a Modalidade</h3>
                  {formData.birthDate && getSuggestedModalities().length > 0 && (
                    <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                      <p className="text-sm text-success font-medium">
                        Modalidades recomendadas para {calculateAge(formData.birthDate)} anos
                      </p>
                    </div>
                  )}
                  <Select 
                    value={formData.selectedModality} 
                    onValueChange={(value) => handleDirectInputChange('selectedModality', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha uma modalidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {sports.filter(s => s.name !== 'Aula Inaugural').map(sport => (
                        <SelectItem key={sport.id} value={sport.id}>
                          {sport.name} ({sport.ageRange.min}-{sport.ageRange.max} anos)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.selectedDate && formData.selectedModality && (
                <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Resumo da Aula Inaugural</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Aluno</p>
                      <p className="font-medium">{formData.name || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data</p>
                      <p className="font-medium">
                        {new Date(formData.selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Modalidade</p>
                      <p className="font-medium">
                        {sports.find(s => s.id === formData.selectedModality)?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor</p>
                      <Badge variant="secondary">Gratuito</Badge>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button variant="outline" onClick={() => navigate('/')}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleConfirmClass} 
                  disabled={isSubmitting || !formData.selectedDate || !formData.selectedModality}
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Calendar className="w-4 h-4 mr-2" />
                  Confirmar Aula Inaugural
                </Button>
                <Button variant="secondary" onClick={handleMatricula}>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Ir para Matrícula
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default InauguralClassPage;
