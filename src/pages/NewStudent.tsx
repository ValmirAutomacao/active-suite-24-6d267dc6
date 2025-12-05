import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Users, MapPin, Heart, Trophy, Loader2 } from 'lucide-react';
import { useSports } from '@/hooks/useSports';
import { Student } from '@/types';
import { toast } from 'sonner';
import PhotoUpload from '@/components/shared/PhotoUpload';
import { useCreateStudent } from '@/hooks/useStudents';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

type FormData = {
  name: string;
  birthDate: string;
  cpf: string;
  photo?: string;
  address: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  guardian: {
    name: string;
    cpf: string;
    phone: string;
    email: string;
    profession: string;
  };
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    email: string;
  }>;
  healthInfo: {
    allergies: string;
    medications: string;
    restrictions: string;
    doctorContact: string;
    healthPlan: string;
  };
  enrolledSports: string[];
  monthlyFee: number;
};

const NewStudent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  
  const { data: sports = [], isLoading: sportsLoading } = useSports();
  
  const [currentTab, setCurrentTab] = useState('personal');
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
      { name: '', relationship: '', phone: '', email: '' }
    ],
    healthInfo: {
      allergies: '',
      medications: '',
      restrictions: '',
      doctorContact: '',
      healthPlan: ''
    },
    enrolledSports: [],
    monthlyFee: 0
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { mutate: createStudent, isPending: isCreating } = useCreateStudent();

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

  const handleSportToggle = (sportId: string) => {
    setFormData(prev => {
      const isSelected = prev.enrolledSports.includes(sportId);
      const newEnrolledSports = isSelected
        ? prev.enrolledSports.filter(id => id !== sportId)
        : [...prev.enrolledSports, sportId];
      
      const newMonthlyFee = newEnrolledSports.reduce((total, id) => {
        const sport = sports.find(s => s.id === id);
        return total + (sport?.monthlyFee || 0);
      }, 0);

      return {
        ...prev,
        enrolledSports: newEnrolledSports,
        monthlyFee: newMonthlyFee
      };
    });
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

  const uploadPhotoToStorage = async (file: File, studentId: string): Promise<string | null> => {
    if (!file) return null;
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const fileName = `students/${studentId}/${Date.now()}_${file.name}`;
      
      const { data, error } = await supabase
        .storage
        .from('student-photos')
        .upload(fileName, file, { 
          cacheControl: '3600',
          upsert: true 
        });
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase
        .storage
        .from('student-photos')
        .getPublicUrl(fileName);
      
      setUploadProgress(100);
      return publicUrl;
    } catch (error: any) {
      console.error('Erro no upload da foto:', error);
      toast.error('Erro ao fazer upload da foto: ' + error.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const dataURLToFile = async (dataUrl: string, fileName: string): Promise<File | null> => {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      return new File([blob], fileName, { type: 'image/jpeg' });
    } catch (error) {
      console.error('Erro ao converter data URL para arquivo:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.birthDate || !formData.cpf) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }

    let photoUrl = formData.photo;
    if (formData.photo && formData.photo.startsWith('data:image')) {
      const file = await dataURLToFile(formData.photo, 'photo.jpg');
      if (file) {
        toast.info('Fazendo upload da foto...');
        photoUrl = await uploadPhotoToStorage(file, crypto.randomUUID());
      }
    }

    const studentToCreate = {
      ...formData,
      photo: photoUrl || null,
      address: formData.address,
      guardian: formData.guardian,
      emergencyContacts: formData.emergencyContacts.filter(c => c.name && c.phone),
      healthInfo: formData.healthInfo,
      enrolledSports: formData.enrolledSports,
      status: 'active' as const,
      enrollmentDate: new Date().toISOString().split('T')[0],
      monthlyFee: formData.monthlyFee,
      paymentStatus: 'pending' as const
    };
    
    createStudent(studentToCreate as Omit<Student, 'id' | 'created_at' | 'updated_at'>, {
      onSuccess: () => {
        toast.success('Aluno cadastrado com sucesso!');
        navigate('/students');
      },
      onError: (error) => {
        console.error('Erro ao criar aluno:', error);
        toast.error('Erro ao cadastrar aluno: ' + error.message);
      }
    });
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
        <h1 className="text-3xl font-bold text-foreground">
          {isEditing ? 'Editar Aluno' : 'Cadastro de Novo Aluno'}
        </h1>
        <p className="text-muted-foreground">
          {isEditing ? 'Edite os dados do aluno abaixo' : 'Preencha todos os dados do novo aluno'}
        </p>
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
              <TabsTrigger value="sports" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Modalidades
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
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Fazendo upload da foto... {uploadProgress}%</p>
                    </div>
                  )}
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
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('address', 'state', e.target.value)}
                    required
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
                    <Textarea
                      id="allergies"
                      value={formData.healthInfo.allergies}
                      onChange={(e) => handleInputChange('healthInfo', 'allergies', e.target.value)}
                      placeholder="Descreva alergias conhecidas"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medications">Medicamentos em Uso</Label>
                    <Textarea
                      id="medications"
                      value={formData.healthInfo.medications}
                      onChange={(e) => handleInputChange('healthInfo', 'medications', e.target.value)}
                      placeholder="Liste medicamentos em uso contínuo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="restrictions">Restrições</Label>
                    <Textarea
                      id="restrictions"
                      value={formData.healthInfo.restrictions}
                      onChange={(e) => handleInputChange('healthInfo', 'restrictions', e.target.value)}
                      placeholder="Restrições alimentares ou de atividade"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctorContact">Contato do Médico</Label>
                    <Input
                      id="doctorContact"
                      value={formData.healthInfo.doctorContact}
                      onChange={(e) => handleInputChange('healthInfo', 'doctorContact', e.target.value)}
                      placeholder="Nome e telefone do médico"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="healthPlan">Plano de Saúde</Label>
                    <Input
                      id="healthPlan"
                      value={formData.healthInfo.healthPlan}
                      onChange={(e) => handleInputChange('healthInfo', 'healthPlan', e.target.value)}
                      placeholder="Nome do plano e número da carteirinha"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sports" className="space-y-6 mt-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Selecione as Modalidades</h3>
                
                {formData.birthDate && getSuggestedModalities().length > 0 && (
                  <div className="mb-4 p-4 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-sm text-success font-medium">
                      Modalidades recomendadas para {calculateAge(formData.birthDate)} anos:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getSuggestedModalities().map(s => s.name).join(', ')}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sports.filter(sport => sport.name !== 'Aula Inaugural').map(sport => (
                    <div
                      key={sport.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        formData.enrolledSports.includes(sport.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleSportToggle(sport.id)}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{sport.name}</h4>
                        <span className="text-sm font-semibold text-primary">
                          R$ {sport.monthlyFee.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{sport.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Faixa etária: {sport.ageRange.min} - {sport.ageRange.max} anos
                      </p>
                    </div>
                  ))}
                </div>

                {formData.enrolledSports.length > 0 && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Resumo</h4>
                    <div className="space-y-2">
                      {formData.enrolledSports.map(sportId => {
                        const sport = sports.find(s => s.id === sportId);
                        return sport ? (
                          <div key={sportId} className="flex justify-between text-sm">
                            <span>{sport.name}</span>
                            <span>R$ {sport.monthlyFee.toFixed(2)}</span>
                          </div>
                        ) : null;
                      })}
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total Mensal</span>
                        <span className="text-primary">R$ {formData.monthlyFee.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button variant="outline" onClick={() => navigate('/students')}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={isCreating || isUploading}>
                  {(isCreating || isUploading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isEditing ? 'Atualizar Aluno' : 'Cadastrar Aluno'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewStudent;
