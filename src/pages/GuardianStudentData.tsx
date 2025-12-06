import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Calendar, Phone, Mail, MapPin, Heart, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Student {
  id: string;
  name: string;
  birthDate: string;
  cpf: string;
  photo_url: string | null;
  status: string;
  enrolledSports: string[];
  guardian: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  };
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  healthInfo: {
    bloodType: string;
    allergies: string;
    medications: string;
    medicalConditions: string;
  };
  emergencyContacts: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
}

interface Sport {
  id: string;
  name: string;
}

export default function GuardianStudentData() {
  const [student, setStudent] = useState<Student | null>(null);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) return;

        // Buscar aluno pelo email do responsável
        const { data: students } = await supabase
          .from('students')
          .select('*')
          .filter('guardian->>email', 'eq', user.email)
          .in('status', ['active', 'effective'])
          .limit(1);

        if (students && students.length > 0) {
          const studentData = students[0];
          setStudent({
            ...studentData,
            guardian: studentData.guardian as Student['guardian'],
            address: studentData.address as Student['address'],
            healthInfo: studentData.healthInfo as Student['healthInfo'],
            emergencyContacts: (studentData.emergencyContacts || []) as Student['emergencyContacts'],
          });

          // Buscar modalidades
          if (studentData.enrolledSports?.length > 0) {
            const { data: sportsData } = await supabase
              .from('sports')
              .select('id, name')
              .in('id', studentData.enrolledSports);
            setSports(sportsData || []);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados do aluno:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum aluno encontrado</h3>
            <p className="text-muted-foreground">
              Você ainda não possui um aluno matriculado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const age = differenceInYears(new Date(), new Date(student.birthDate));

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      active: { label: 'Ativo', variant: 'default' },
      effective: { label: 'Efetivo', variant: 'default' },
      provisional: { label: 'Provisório', variant: 'secondary' },
      inactive: { label: 'Inativo', variant: 'destructive' },
    };
    const config = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header com foto e nome */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={student.photo_url || undefined} alt={student.name} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{student.name}</h2>
              <p className="text-muted-foreground">{age} anos</p>
              <div className="mt-2">{getStatusBadge(student.status || 'active')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modalidades */}
      {sports.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Modalidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {sports.map(sport => (
                <Badge key={sport.id} variant="secondary">{sport.name}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dados Pessoais */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Dados Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-sm text-muted-foreground">Data de Nascimento</span>
            <p className="font-medium">
              {format(new Date(student.birthDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">CPF</span>
            <p className="font-medium">{student.cpf}</p>
          </div>
        </CardContent>
      </Card>

      {/* Responsável */}
      {student.guardian && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Responsável
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">Nome</span>
              <p className="font-medium">{student.guardian.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p>{student.guardian.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <p>{student.guardian.phone}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Endereço */}
      {student.address && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {student.address.street}, {student.address.number}
            </p>
            <p>{student.address.neighborhood}</p>
            <p>
              {student.address.city} - {student.address.state}
            </p>
            <p>CEP: {student.address.zipCode}</p>
          </CardContent>
        </Card>
      )}

      {/* Informações de Saúde */}
      {student.healthInfo && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Informações de Saúde
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {student.healthInfo.bloodType && (
              <div>
                <span className="text-sm text-muted-foreground">Tipo Sanguíneo</span>
                <p className="font-medium">{student.healthInfo.bloodType}</p>
              </div>
            )}
            {student.healthInfo.allergies && (
              <div>
                <span className="text-sm text-muted-foreground">Alergias</span>
                <p className="font-medium">{student.healthInfo.allergies}</p>
              </div>
            )}
            {student.healthInfo.medications && (
              <div>
                <span className="text-sm text-muted-foreground">Medicamentos</span>
                <p className="font-medium">{student.healthInfo.medications}</p>
              </div>
            )}
            {student.healthInfo.medicalConditions && (
              <div>
                <span className="text-sm text-muted-foreground">Condições Médicas</span>
                <p className="font-medium">{student.healthInfo.medicalConditions}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contatos de Emergência */}
      {student.emergencyContacts && student.emergencyContacts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Contatos de Emergência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {student.emergencyContacts.map((contact, index) => (
              <div key={index} className="border-b last:border-0 pb-3 last:pb-0">
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">{contact.phone}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
