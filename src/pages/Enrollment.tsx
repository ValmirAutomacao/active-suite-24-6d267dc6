import React, { useState } from 'react';
import { User, Users, Phone, Heart, Trophy, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { mockSports } from '@/data/mockSports';
import Button from '@/components/shared/Button';
import FormInput from '@/components/shared/FormInput';

interface FormData {
  // Personal Data
  name: string;
  birthDate: string;
  cpf: string;
  photo: string;
  address: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  // Guardian Data
  guardian: {
    name: string;
    cpf: string;
    phone: string;
    email: string;
    profession: string;
  };
  // Emergency Contacts
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    email: string;
  }>;
  // Health Info
  healthInfo: {
    allergies: string;
    medications: string;
    restrictions: string;
    doctorContact: string;
    healthPlan: string;
  };
  // Sports
  selectedSports: string[];
}

const Enrollment: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
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
      { name: '', relationship: '', phone: '', email: '' },
      { name: '', relationship: '', phone: '', email: '' }
    ],
    healthInfo: {
      allergies: '',
      medications: '',
      restrictions: '',
      doctorContact: '',
      healthPlan: ''
    },
    selectedSports: []
  });

  const steps = [
    { id: 1, title: 'Dados Pessoais', icon: User },
    { id: 2, title: 'Responsável', icon: Users },
    { id: 3, title: 'Emergência', icon: Phone },
    { id: 4, title: 'Saúde', icon: Heart },
    { id: 5, title: 'Modalidades', icon: Trophy },
    { id: 6, title: 'Revisão', icon: CheckCircle }
  ];

  const updateFormData = (section: string, data: any) => {
    if (section === '') {
      setFormData(prev => ({ ...prev, ...data }));
    } else if (section === 'emergencyContacts') {
      setFormData(prev => ({ ...prev, emergencyContacts: data }));
    } else if (section === 'selectedSports') {
      setFormData(prev => ({ ...prev, selectedSports: data }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: { ...(prev[section as keyof FormData] as object), ...data }
      }));
    }
  };

  const handleSubmit = () => {
    console.log('Submitting enrollment:', formData);
    alert('Matrícula realizada com sucesso!');
  };

  const calculateTotalFee = () => {
    return formData.selectedSports.reduce((total, sportId) => {
      const sport = mockSports.find(s => s.id === sportId);
      return total + (sport?.monthlyFee || 0);
    }, 0);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Dados Pessoais do Aluno</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Nome Completo *"
                value={formData.name}
                onChange={(e) => updateFormData('', { name: e.target.value })}
                placeholder="Digite o nome completo"
              />
              <FormInput
                label="Data de Nascimento *"
                type="date"
                value={formData.birthDate}
                onChange={(e) => updateFormData('', { birthDate: e.target.value })}
              />
              <FormInput
                label="CPF *"
                value={formData.cpf}
                onChange={(e) => updateFormData('', { cpf: e.target.value })}
                placeholder="000.000.000-00"
              />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Endereço</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Rua *"
                  value={formData.address.street}
                  onChange={(e) => updateFormData('address', { street: e.target.value })}
                  placeholder="Nome da rua"
                />
                <FormInput
                  label="Número *"
                  value={formData.address.number}
                  onChange={(e) => updateFormData('address', { number: e.target.value })}
                  placeholder="123"
                />
                <FormInput
                  label="Complemento"
                  value={formData.address.complement}
                  onChange={(e) => updateFormData('address', { complement: e.target.value })}
                  placeholder="Apartamento, bloco, etc."
                />
                <FormInput
                  label="Bairro *"
                  value={formData.address.neighborhood}
                  onChange={(e) => updateFormData('address', { neighborhood: e.target.value })}
                  placeholder="Nome do bairro"
                />
                <FormInput
                  label="Cidade *"
                  value={formData.address.city}
                  onChange={(e) => updateFormData('address', { city: e.target.value })}
                  placeholder="Nome da cidade"
                />
                <FormInput
                  label="Estado *"
                  value={formData.address.state}
                  onChange={(e) => updateFormData('address', { state: e.target.value })}
                  placeholder="UF"
                />
                <FormInput
                  label="CEP *"
                  value={formData.address.zipCode}
                  onChange={(e) => updateFormData('address', { zipCode: e.target.value })}
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Dados do Responsável</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Nome Completo *"
                value={formData.guardian.name}
                onChange={(e) => updateFormData('guardian', { name: e.target.value })}
                placeholder="Nome do responsável"
              />
              <FormInput
                label="CPF *"
                value={formData.guardian.cpf}
                onChange={(e) => updateFormData('guardian', { cpf: e.target.value })}
                placeholder="000.000.000-00"
              />
              <FormInput
                label="Telefone *"
                value={formData.guardian.phone}
                onChange={(e) => updateFormData('guardian', { phone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
              <FormInput
                label="Email *"
                type="email"
                value={formData.guardian.email}
                onChange={(e) => updateFormData('guardian', { email: e.target.value })}
                placeholder="email@exemplo.com"
              />
              <FormInput
                label="Profissão"
                value={formData.guardian.profession}
                onChange={(e) => updateFormData('guardian', { profession: e.target.value })}
                placeholder="Profissão do responsável"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Contatos de Emergência</h2>
            {formData.emergencyContacts.map((contact, index) => (
              <div key={index} className="bg-muted/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-foreground mb-3">Contato {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Nome Completo"
                    value={contact.name}
                    onChange={(e) => {
                      const newContacts = [...formData.emergencyContacts];
                      newContacts[index].name = e.target.value;
                      updateFormData('emergencyContacts', newContacts);
                    }}
                    placeholder="Nome do contato"
                  />
                  <FormInput
                    label="Parentesco"
                    value={contact.relationship}
                    onChange={(e) => {
                      const newContacts = [...formData.emergencyContacts];
                      newContacts[index].relationship = e.target.value;
                      updateFormData('emergencyContacts', newContacts);
                    }}
                    placeholder="Pai, Mãe, Avô, etc."
                  />
                  <FormInput
                    label="Telefone"
                    value={contact.phone}
                    onChange={(e) => {
                      const newContacts = [...formData.emergencyContacts];
                      newContacts[index].phone = e.target.value;
                      updateFormData('emergencyContacts', newContacts);
                    }}
                    placeholder="(00) 00000-0000"
                  />
                  <FormInput
                    label="Email"
                    type="email"
                    value={contact.email}
                    onChange={(e) => {
                      const newContacts = [...formData.emergencyContacts];
                      newContacts[index].email = e.target.value;
                      updateFormData('emergencyContacts', newContacts);
                    }}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Informações de Saúde</h2>
            <div className="grid grid-cols-1 gap-4">
              <FormInput
                label="Alergias"
                value={formData.healthInfo.allergies}
                onChange={(e) => updateFormData('healthInfo', { allergies: e.target.value })}
                placeholder="Descreva alergias conhecidas"
              />
              <FormInput
                label="Medicamentos"
                value={formData.healthInfo.medications}
                onChange={(e) => updateFormData('healthInfo', { medications: e.target.value })}
                placeholder="Medicamentos em uso contínuo"
              />
              <FormInput
                label="Restrições Médicas"
                value={formData.healthInfo.restrictions}
                onChange={(e) => updateFormData('healthInfo', { restrictions: e.target.value })}
                placeholder="Restrições ou limitações médicas"
              />
              <FormInput
                label="Contato do Médico"
                value={formData.healthInfo.doctorContact}
                onChange={(e) => updateFormData('healthInfo', { doctorContact: e.target.value })}
                placeholder="Dr. João - (00) 0000-0000"
              />
              <FormInput
                label="Plano de Saúde"
                value={formData.healthInfo.healthPlan}
                onChange={(e) => updateFormData('healthInfo', { healthPlan: e.target.value })}
                placeholder="Nome do plano de saúde"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Seleção de Modalidades</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockSports.map(sport => (
                <div key={sport.id} className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  formData.selectedSports.includes(sport.id) 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => {
                  const newSports = formData.selectedSports.includes(sport.id)
                    ? formData.selectedSports.filter(id => id !== sport.id)
                    : [...formData.selectedSports, sport.id];
                  updateFormData('selectedSports', newSports);
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{sport.name}</h3>
                    <span className="text-lg font-bold text-primary">R$ {(sport.monthlyFee || 0).toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{sport.description}</p>
                  <div className="text-xs text-muted-foreground">
                    <p>Idade: {sport.ageRange.min}-{sport.ageRange.max} anos</p>
                    <p>Instrutor: {sport.instructor}</p>
                    <p>Horários: {sport.weeklyHours}h/semana</p>
                  </div>
                </div>
              ))}
            </div>
            {formData.selectedSports.length > 0 && (
              <div className="bg-primary/10 border border-primary rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">Resumo da Matrícula</h3>
                <div className="space-y-1">
                  {formData.selectedSports.map(sportId => {
                    const sport = mockSports.find(s => s.id === sportId);
                    return sport ? (
                      <div key={sportId} className="flex justify-between text-sm">
                        <span className="text-foreground">{sport.name}</span>
                        <span className="text-foreground">R$ {(sport.monthlyFee || 0).toFixed(2)}</span>
                      </div>
                    ) : null;
                  })}
                  <div className="border-t border-primary pt-2 flex justify-between font-bold">
                    <span className="text-foreground">Total Mensal:</span>
                    <span className="text-primary">R$ {calculateTotalFee().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Revisão dos Dados</h2>
            
            {/* Summary sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-3">Dados Pessoais</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Nome:</span> {formData.name}</p>
                  <p><span className="text-muted-foreground">CPF:</span> {formData.cpf}</p>
                  <p><span className="text-muted-foreground">Data de Nascimento:</span> {formData.birthDate}</p>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-3">Responsável</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Nome:</span> {formData.guardian.name}</p>
                  <p><span className="text-muted-foreground">Telefone:</span> {formData.guardian.phone}</p>
                  <p><span className="text-muted-foreground">Email:</span> {formData.guardian.email}</p>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">Modalidades Selecionadas</h3>
              <div className="space-y-2">
                {formData.selectedSports.map(sportId => {
                  const sport = mockSports.find(s => s.id === sportId);
                  return sport ? (
                    <div key={sportId} className="flex justify-between">
                      <span className="text-foreground">{sport.name}</span>
                      <span className="text-foreground">R$ {(sport.monthlyFee || 0).toFixed(2)}</span>
                    </div>
                  ) : null;
                })}
                <div className="border-t border-primary pt-2 flex justify-between font-bold text-lg">
                  <span className="text-foreground">Total Mensal:</span>
                  <span className="text-primary">R$ {calculateTotalFee().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Nova Matrícula</h1>
        <p className="text-muted-foreground">Preencha todos os dados para matricular o aluno</p>
      </div>

      {/* Stepper */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                currentStep === step.id 
                  ? 'border-primary bg-primary text-primary-foreground' 
                  : currentStep > step.id
                    ? 'border-success bg-success text-success-foreground'
                    : 'border-border bg-card text-muted-foreground'
              }`}>
                <step.icon className="w-5 h-5" />
              </div>
              <div className="ml-3 mr-6">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mr-6 ${
                  currentStep > step.id ? 'bg-success' : 'bg-border'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto bg-card border border-border rounded-lg p-8 shadow-academy">
        {renderStep()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <Button 
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>
          <Button 
            variant="primary"
            onClick={() => {
              if (currentStep < 6) {
                setCurrentStep(currentStep + 1);
              } else {
                handleSubmit();
              }
            }}
          >
            {currentStep === 6 ? 'Finalizar Matrícula' : 'Próximo'}
            {currentStep < 6 && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Enrollment;