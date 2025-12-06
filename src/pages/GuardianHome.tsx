import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, ClipboardList, ChevronRight, Sparkles } from 'lucide-react';

const GuardianHome: React.FC = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Responsável';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      {/* Header com saudação */}
      <div className="text-center mb-8 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Bem-vindo(a)!</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Olá, {displayName}!
        </h1>
        <p className="text-muted-foreground text-sm">
          O que você gostaria de fazer hoje?
        </p>
      </div>

      {/* Cards interativos */}
      <div className="space-y-4 max-w-md mx-auto">
        {/* Card Aula Inaugural */}
        <Card 
          className="cursor-pointer group border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 active:scale-[0.98]"
          onClick={() => navigate('/guardian/inaugural')}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Aula Inaugural
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Agende uma aula experimental gratuita para seu filho conhecer a academia e escolher a modalidade ideal.
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <ChevronRight className="h-5 w-5 text-primary group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-primary/10">
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                Gratuito • Sem compromisso
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card Matrícula */}
        <Card 
          className="cursor-pointer group border-2 border-secondary/30 bg-gradient-to-br from-secondary/5 to-secondary/10 hover:border-secondary/50 hover:shadow-lg hover:shadow-secondary/10 transition-all duration-300 active:scale-[0.98]"
          onClick={() => navigate('/guardian/enrollment')}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <ClipboardList className="h-7 w-7 text-secondary-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Matrícula
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Realize a matrícula completa do seu filho e garanta a vaga na modalidade escolhida.
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                <ChevronRight className="h-5 w-5 text-secondary-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-secondary/10">
              <span className="text-xs font-medium text-secondary-foreground uppercase tracking-wider">
                Formulário completo • Pagamento online
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info adicional */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          Dúvidas? Entre em contato conosco pelo WhatsApp
        </p>
      </div>
    </div>
  );
};

export default GuardianHome;
