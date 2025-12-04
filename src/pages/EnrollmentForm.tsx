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
import { mockSports } from '@/data/mockSports';
import { Student } from '@/types';
import { toast } from 'sonner';
import PhotoUpload from '@/components/shared/PhotoUpload';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import supabase from '@/lib/supabaseClient';

const EnrollmentForm: React.FC = () => {
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
      email: user?.email || '',
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

  const generateModalityUuid = (sportId: string) => {
    const paddedId = sportId.padStart(8, '0');
    return `${paddedId}-0000-0000-0000-000000000000`;
  };

  const handleInputChange = (field: string, value: any) => {
    const keys = field.split('.');
    setFormData(prev => {
      const newData = { ...prev };
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
      [arrayName]: prev[arrayName].map((item, i) =>
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

      // Criar estudante na tabela students (usando nomes corretos das colunas)
      const studentData = {
        name: formData.name,
        cpf: formData.cpf,
        birthDate: formData.birthDate, // ATENÇÃO: verificar se o banco espera 'birthDate' ou 'birth_date'
        address: formData.address,
        guardian: formData.guardian,
        emergencyContacts: formData.emergencyContacts,
        healthInfo: formData.medical, // Campo correto é 'healthInfo'
        photo: formData.photo,
        status: 'effective',
        monthlyFee: formData.paymentInfo.monthlyFee,
        enrollment_fee: formData.paymentInfo.enrollmentFee, // Campo adicionado no script
        payment_due_date: parseInt(formData.paymentInfo.dueDate), // Campo adicionado no script
        enrollmentDate: new Date().toISOString().split('T')[0], // Campo obrigatório como DATE
        enrolledSports: [formData.selectedSportId] // Array de sports
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
        modality_id: generateModalityUuid(formData.selectedSportId),
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

      // Atualizar perfil do usuário para indicar que completou a matrícula
      await updateProfile({
        onboarding_completed: true
      });

      toast.success('Matrícula realizada com sucesso!');

      // Redirecionar para dashboard de matrícula
      navigate('/enrollment-dashboard');

    } catch (error: any) {
      console.error('Erro ao confirmar matrícula:', error);
      toast.error('Erro ao confirmar matrícula: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSport = mockSports.find(sport => sport.id === formData.selectedSportId);

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
                    onPhotoChange={(photo) => handleInputChange('photo', photo)}
                    currentPhoto={formData.photo}
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
                      placeholder="Profissão do responsável"
                    />
                  </div>
                </div>

                <h3 className="text-lg font-semibold">Contatos de Emergência</h3>
                {formData.emergencyContacts.map((contact, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <h4 className="font-medium">Contato {index + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nome do Contato</Label>
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

            {/* Tab Informações Médicas */}
            <TabsContent value="medical" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="allergies">Alergias Conhecidas</Label>
                  <Textarea
                    id="allergies"
                    value={formData.medical.allergies}
                    onChange={(e) => handleInputChange('medical.allergies', e.target.value)}
                    placeholder="Descreva alergias conhecidas"
                  />
                </div>
                <div>
                  <Label htmlFor="medications">Medicamentos em Uso</Label>
                  <Textarea
                    id="medications"
                    value={formData.medical.medications}
                    onChange={(e) => handleInputChange('medical.medications', e.target.value)}
                    placeholder="Medicamentos em uso contínuo"
                  />
                </div>
                <div>
                  <Label htmlFor="conditions">Condições Médicas</Label>
                  <Textarea
                    id="conditions"
                    value={formData.medical.conditions}
                    onChange={(e) => handleInputChange('medical.conditions', e.target.value)}
                    placeholder="Restrições ou limitações médicas"
                  />
                </div>
                <div>
                  <Label htmlFor="doctor">Médico de Referência</Label>
                  <Input
                    id="doctor"
                    value={formData.medical.doctor}
                    onChange={(e) => handleInputChange('medical.doctor', e.target.value)}
                    placeholder="Dr. João - (00) 0000-0000"
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
              <div>
                <h3 className="text-lg font-semibold mb-4">Escolha a Modalidade Esportiva</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockSports.map((sport) => (
                    <Card
                      key={sport.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        formData.selectedSportId === sport.id
                          ? 'ring-2 ring-primary border-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleInputChange('selectedSportId', sport.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center space-y-2">
                          <Trophy className="w-8 h-8 text-primary" />
                          <h4 className="font-semibold">{sport.name}</h4>
                          <p className="text-sm text-muted-foreground">{sport.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {sport.ageRange ? (
                              <Badge variant="secondary" className="text-xs">
                                {sport.ageRange.min} - {sport.ageRange.max} anos
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-sm font-medium text-primary">
                            R$ {sport.monthlyFee?.toFixed(2) || '150,00'}/mês
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedSport && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        {selectedSport.name} Selecionado
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p><strong>Descrição:</strong> {selectedSport.description}</p>
                          <p><strong>Idades:</strong> {selectedSport.ageRange ? `${selectedSport.ageRange.min} - ${selectedSport.ageRange.max} anos` : 'A definir'}</p>
                          <p><strong>Horários:</strong> {selectedSport.schedule?.map(s => `${s.day} ${s.startTime}-${s.endTime}`).join(', ') || 'A definir'}</p>
                        </div>
                        <div>
                          <p><strong>Local:</strong> {selectedSport.location || 'Academia Principal'}</p>
                          <p><strong>Mensalidade:</strong> R$ {selectedSport.monthlyFee?.toFixed(2) || '150,00'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Tab Pagamento */}
            <TabsContent value="payment" className="space-y-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Informações de Pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Valor da Mensalidade</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.paymentInfo.monthlyFee}
                          onChange={(e) => handleInputChange('paymentInfo.monthlyFee', parseFloat(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Taxa de Matrícula</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.paymentInfo.enrollmentFee}
                          onChange={(e) => handleInputChange('paymentInfo.enrollmentFee', parseFloat(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Forma de Pagamento *</Label>
                        <Select onValueChange={(value) => handleInputChange('paymentInfo.paymentMethod', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a forma de pagamento" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                            <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                            <SelectItem value="bank_slip">Boleto Bancário</SelectItem>
                            <SelectItem value="pix">PIX</SelectItem>
                            <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Dia de Vencimento</Label>
                        <Select
                          value={formData.paymentInfo.dueDate}
                          onValueChange={(value) => handleInputChange('paymentInfo.dueDate', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Dia do vencimento" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({length: 28}, (_, i) => i + 1).map(day => (
                              <SelectItem key={day} value={day.toString()}>
                                Dia {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Resumo da Matrícula</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Modalidade:</strong> {selectedSport?.name || 'Não selecionada'}</p>
                        <p><strong>Taxa de Matrícula:</strong> R$ {formData.paymentInfo.enrollmentFee.toFixed(2)}</p>
                        <p><strong>Mensalidade:</strong> R$ {formData.paymentInfo.monthlyFee.toFixed(2)}</p>
                        <p><strong>Total Inicial:</strong> R$ {(formData.paymentInfo.enrollmentFee + formData.paymentInfo.monthlyFee).toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Botões de Navegação */}
            <div className="flex justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentTab === 'personal'}
              >
                Voltar
              </Button>

              {currentTab !== 'payment' ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      Finalizar Matrícula
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnrollmentForm;