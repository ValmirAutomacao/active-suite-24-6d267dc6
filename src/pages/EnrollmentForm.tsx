import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User, Users, MapPin, Heart, Trophy, Calendar, ArrowRight, DollarSign } from 'lucide-react';
import { useSports } from '@/hooks/useSports';
import { toast } from 'sonner';
import PhotoUpload from '@/components/shared/PhotoUpload';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const EnrollmentForm: React.FC = () => {
  const navigate = useNavigate();
  const { data: sports, isLoading: sportsLoading } = useSports();
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
      { name: '', relationship: '', phone: '', email: '' },
      { name: '', relationship: '', phone: '', email: '' }
    ],
    // Informações Médicas
    medical: {
      allergies: '',
      medications: '',
      conditions: '',
      doctor: '',
      healthPlan: ''
    },
    // Modalidade Escolhida
    selectedSportId: '',
    // Informações de Pagamento
    paymentInfo: {
      monthlyFee: 150.00,
      enrollmentFee: 50.00,
      paymentMethod: '',
      dueDate: '5' // dia do vencimento
    }
  });

  const handleInputChange = (field: string, value: any) => {
    const keys = field.split('.');
    setFormData(prev => {
      const newData = { ...prev } as any;
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleArrayChange = (arrayName: string, index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: (prev as any)[arrayName].map((item: any, i: number) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const validatePersonalData = () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return false;
    }
    if (!formData.birthDate) {
      toast.error('Data de nascimento é obrigatória');
      return false;
    }
    if (!formData.cpf.trim()) {
      toast.error('CPF é obrigatório');
      return false;
    }
    return true;
  };

  const validateContactData = () => {
    if (!formData.guardian.name.trim()) {
      toast.error('Nome do responsável é obrigatório');
      return false;
    }
    if (!formData.guardian.phone.trim()) {
      toast.error('Telefone do responsável é obrigatório');
      return false;
    }
    return true;
  };

  const validateSportSelection = () => {
    if (!formData.selectedSportId) {
      toast.error('Selecione uma modalidade esportiva');
      return false;
    }
    return true;
  };

  const validatePaymentInfo = () => {
    if (!formData.paymentInfo.paymentMethod) {
      toast.error('Selecione a forma de pagamento');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentTab === 'personal' && validatePersonalData()) {
      setCurrentTab('contact');
    } else if (currentTab === 'contact' && validateContactData()) {
      setCurrentTab('medical');
    } else if (currentTab === 'medical') {
      setCurrentTab('sport');
    } else if (currentTab === 'sport' && validateSportSelection()) {
      setCurrentTab('payment');
    }
  };

  const handleBack = () => {
    if (currentTab === 'contact') setCurrentTab('personal');
    else if (currentTab === 'medical') setCurrentTab('contact');
    else if (currentTab === 'sport') setCurrentTab('medical');
    else if (currentTab === 'payment') setCurrentTab('sport');
  };

  const handleSubmit = async () => {
    if (!validatePersonalData() || !validateContactData() || !validateSportSelection() || !validatePaymentInfo()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Confirmando matrícula...', formData);

      // Criar estudante na tabela students
      const studentData = {
        name: formData.name,
        cpf: formData.cpf,
        birthDate: formData.birthDate,
        address: formData.address,
        guardian: formData.guardian,
        emergencyContacts: formData.emergencyContacts,
        healthInfo: formData.medical,
        photo: formData.photo,
        status: 'active',
        monthlyFee: formData.paymentInfo.monthlyFee,
        enrollment_fee: formData.paymentInfo.enrollmentFee,
        payment_due_date: parseInt(formData.paymentInfo.dueDate),
        enrollmentDate: new Date().toISOString().split('T')[0],
        enrolledSports: [formData.selectedSportId]
      };

      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert([studentData])
        .select()
        .single();

      if (studentError) throw studentError;

      console.log('Estudante criado:', student);

      // Criar matrícula na modalidade escolhida
      const enrollmentData = {
        student_id: student.id,
        modality_id: formData.selectedSportId,
        status: 'active',
        monthly_fee: formData.paymentInfo.monthlyFee,
        enrollment_fee: formData.paymentInfo.enrollmentFee,
        payment_due_date: parseInt(formData.paymentInfo.dueDate),
        payment_method: formData.paymentInfo.paymentMethod,
        created_at: new Date().toISOString()
      };

      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .insert([enrollmentData]);

      if (enrollmentError) throw enrollmentError;

      toast.success('Matrícula realizada com sucesso!');

      // Redirecionar para lista de alunos
      navigate('/students');

    } catch (error: any) {
      console.error('Erro ao confirmar matrícula:', error);
      toast.error('Erro ao confirmar matrícula: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSport = sports?.find(sport => sport.id === formData.selectedSportId);

  const getAgeRange = (sport: any) => {
    const ageRange = sport.ageRange as { min?: number; max?: number } | null;
    if (ageRange && typeof ageRange === 'object') {
      return `${ageRange.min || 0}-${ageRange.max || 99}`;
    }
    return '0-99';
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Formulário de Matrícula
          </CardTitle>
          <CardDescription>
            Preencha todas as informações para completar a matrícula do aluno
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Pessoais
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Contatos
              </TabsTrigger>
              <TabsTrigger value="medical" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Médicas
              </TabsTrigger>
              <TabsTrigger value="sport" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Modalidade
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Pagamento
              </TabsTrigger>
            </TabsList>

            {/* Tab Dados Pessoais */}
            <TabsContent value="personal" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Nome completo do aluno"
                    />
                  </div>

                  <div>
                    <Label htmlFor="birthDate">Data de Nascimento *</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange('cpf', e.target.value)}
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <PhotoUpload
                    onChange={(photo) => handleInputChange('photo', photo)}
                    value={formData.photo}
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Endereço
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      value={formData.address.street}
                      onChange={(e) => handleInputChange('address.street', e.target.value)}
                      placeholder="Nome da rua"
                    />
                  </div>
                  <div>
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      value={formData.address.number}
                      onChange={(e) => handleInputChange('address.number', e.target.value)}
                      placeholder="123"
                    />
                  </div>
                  <div>
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      value={formData.address.complement}
                      onChange={(e) => handleInputChange('address.complement', e.target.value)}
                      placeholder="Apartamento, bloco, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      value={formData.address.neighborhood}
                      onChange={(e) => handleInputChange('address.neighborhood', e.target.value)}
                      placeholder="Nome do bairro"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) => handleInputChange('address.city', e.target.value)}
                      placeholder="Nome da cidade"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Select onValueChange={(value) => handleInputChange('address.state', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AC">Acre</SelectItem>
                        <SelectItem value="AL">Alagoas</SelectItem>
                        <SelectItem value="AP">Amapá</SelectItem>
                        <SelectItem value="AM">Amazonas</SelectItem>
                        <SelectItem value="BA">Bahia</SelectItem>
                        <SelectItem value="CE">Ceará</SelectItem>
                        <SelectItem value="DF">Distrito Federal</SelectItem>
                        <SelectItem value="ES">Espírito Santo</SelectItem>
                        <SelectItem value="GO">Goiás</SelectItem>
                        <SelectItem value="MA">Maranhão</SelectItem>
                        <SelectItem value="MT">Mato Grosso</SelectItem>
                        <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                        <SelectItem value="MG">Minas Gerais</SelectItem>
                        <SelectItem value="PA">Pará</SelectItem>
                        <SelectItem value="PB">Paraíba</SelectItem>
                        <SelectItem value="PR">Paraná</SelectItem>
                        <SelectItem value="PE">Pernambuco</SelectItem>
                        <SelectItem value="PI">Piauí</SelectItem>
                        <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                        <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                        <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                        <SelectItem value="RO">Rondônia</SelectItem>
                        <SelectItem value="RR">Roraima</SelectItem>
                        <SelectItem value="SC">Santa Catarina</SelectItem>
                        <SelectItem value="SP">São Paulo</SelectItem>
                        <SelectItem value="SE">Sergipe</SelectItem>
                        <SelectItem value="TO">Tocantins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input
                      id="zipCode"
                      value={formData.address.zipCode}
                      onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                      placeholder="00000-000"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab Contatos */}
            <TabsContent value="contact" className="space-y-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Dados do Responsável</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guardianName">Nome do Responsável *</Label>
                    <Input
                      id="guardianName"
                      value={formData.guardian.name}
                      onChange={(e) => handleInputChange('guardian.name', e.target.value)}
                      placeholder="Nome do responsável"
                    />
                  </div>
                  <div>
                    <Label htmlFor="guardianCpf">CPF do Responsável</Label>
                    <Input
                      id="guardianCpf"
                      value={formData.guardian.cpf}
                      onChange={(e) => handleInputChange('guardian.cpf', e.target.value)}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="guardianPhone">Telefone *</Label>
                    <Input
                      id="guardianPhone"
                      value={formData.guardian.phone}
                      onChange={(e) => handleInputChange('guardian.phone', e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="guardianEmail">E-mail</Label>
                    <Input
                      id="guardianEmail"
                      type="email"
                      value={formData.guardian.email}
                      onChange={(e) => handleInputChange('guardian.email', e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="guardianProfession">Profissão</Label>
                    <Input
                      id="guardianProfession"
                      value={formData.guardian.profession}
                      onChange={(e) => handleInputChange('guardian.profession', e.target.value)}
                      placeholder="Profissão"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contatos de Emergência</h3>
                {formData.emergencyContacts.map((contact, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <h4 className="font-medium">Contato {index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nome</Label>
                        <Input
                          value={contact.name}
                          onChange={(e) => handleArrayChange('emergencyContacts', index, 'name', e.target.value)}
                          placeholder="Nome do contato"
                        />
                      </div>
                      <div>
                        <Label>Parentesco</Label>
                        <Input
                          value={contact.relationship}
                          onChange={(e) => handleArrayChange('emergencyContacts', index, 'relationship', e.target.value)}
                          placeholder="Pai, Mãe, Avô, etc."
                        />
                      </div>
                      <div>
                        <Label>Telefone</Label>
                        <Input
                          value={contact.phone}
                          onChange={(e) => handleArrayChange('emergencyContacts', index, 'phone', e.target.value)}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      <div>
                        <Label>E-mail</Label>
                        <Input
                          type="email"
                          value={contact.email}
                          onChange={(e) => handleArrayChange('emergencyContacts', index, 'email', e.target.value)}
                          placeholder="email@exemplo.com"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Tab Médicas */}
            <TabsContent value="medical" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="allergies">Alergias</Label>
                  <Textarea
                    id="allergies"
                    value={formData.medical.allergies}
                    onChange={(e) => handleInputChange('medical.allergies', e.target.value)}
                    placeholder="Descreva alergias conhecidas"
                  />
                </div>
                <div>
                  <Label htmlFor="medications">Medicamentos em uso</Label>
                  <Textarea
                    id="medications"
                    value={formData.medical.medications}
                    onChange={(e) => handleInputChange('medical.medications', e.target.value)}
                    placeholder="Liste medicamentos em uso contínuo"
                  />
                </div>
                <div>
                  <Label htmlFor="conditions">Condições médicas</Label>
                  <Textarea
                    id="conditions"
                    value={formData.medical.conditions}
                    onChange={(e) => handleInputChange('medical.conditions', e.target.value)}
                    placeholder="Condições médicas relevantes"
                  />
                </div>
                <div>
                  <Label htmlFor="doctor">Médico/Contato</Label>
                  <Input
                    id="doctor"
                    value={formData.medical.doctor}
                    onChange={(e) => handleInputChange('medical.doctor', e.target.value)}
                    placeholder="Dr. Nome - (00) 0000-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="healthPlan">Plano de Saúde</Label>
                  <Input
                    id="healthPlan"
                    value={formData.medical.healthPlan}
                    onChange={(e) => handleInputChange('medical.healthPlan', e.target.value)}
                    placeholder="Nome do plano de saúde"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tab Modalidade */}
            <TabsContent value="sport" className="space-y-6">
              <h3 className="text-lg font-semibold">Selecione a Modalidade</h3>
              {sportsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-40 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sports?.map(sport => (
                    <div
                      key={sport.id}
                      onClick={() => {
                        handleInputChange('selectedSportId', sport.id);
                        handleInputChange('paymentInfo.monthlyFee', sport.monthlyFee);
                      }}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        formData.selectedSportId === sport.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-foreground">{sport.name}</h4>
                        <Badge variant={sport.status === 'active' ? 'default' : 'secondary'}>
                          {sport.status === 'active' ? 'Disponível' : 'Indisponível'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{sport.description}</p>
                      <div className="text-sm space-y-1">
                        <p><span className="text-muted-foreground">Idade:</span> {getAgeRange(sport)} anos</p>
                        <p><span className="text-muted-foreground">Instrutor:</span> {sport.instructor || 'A definir'}</p>
                        <p><span className="text-muted-foreground">Carga horária:</span> {sport.weeklyHours}h/semana</p>
                        <p className="text-primary font-semibold">R$ {sport.monthlyFee.toFixed(2)}/mês</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tab Pagamento */}
            <TabsContent value="payment" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informações de Pagamento</h3>
                  
                  <div>
                    <Label htmlFor="paymentMethod">Forma de Pagamento *</Label>
                    <Select onValueChange={(value) => handleInputChange('paymentInfo.paymentMethod', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma de pagamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="boleto">Boleto Bancário</SelectItem>
                        <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                        <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dueDate">Dia do Vencimento</Label>
                    <Select 
                      value={formData.paymentInfo.dueDate}
                      onValueChange={(value) => handleInputChange('paymentInfo.dueDate', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">Dia 5</SelectItem>
                        <SelectItem value="10">Dia 10</SelectItem>
                        <SelectItem value="15">Dia 15</SelectItem>
                        <SelectItem value="20">Dia 20</SelectItem>
                        <SelectItem value="25">Dia 25</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                  <h3 className="text-lg font-semibold">Resumo da Matrícula</h3>
                  
                  {selectedSport && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Modalidade:</span>
                        <span className="font-medium">{selectedSport.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mensalidade:</span>
                        <span className="font-medium">R$ {selectedSport.monthlyFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxa de Matrícula:</span>
                        <span className="font-medium">R$ {formData.paymentInfo.enrollmentFee.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-semibold">Total Inicial:</span>
                        <span className="font-bold text-primary">
                          R$ {(selectedSport.monthlyFee + formData.paymentInfo.enrollmentFee).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Navegação */}
          <div className="flex justify-between mt-6 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentTab === 'personal'}
            >
              Voltar
            </Button>
            
            {currentTab === 'payment' ? (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Processando...' : 'Confirmar Matrícula'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnrollmentForm;
