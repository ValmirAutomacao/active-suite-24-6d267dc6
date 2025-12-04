import React from 'react';
import { useStudentsABCCurve } from '@/hooks/useReports';
import { TrendingUp, Users, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const ABCCurveChart: React.FC = () => {
  const { data: abcData, isLoading, error } = useStudentsABCCurve();

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-card-foreground">Curva ABC - Análise de Receita</h3>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !abcData) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-5 h-5 text-destructive" />
          <h3 className="text-lg font-semibold text-card-foreground">Curva ABC - Erro</h3>
        </div>
        <p className="text-muted-foreground">Erro ao carregar dados da curva ABC</p>
      </div>
    );
  }

  const classificationStats = {
    A: abcData.filter(s => s.classification === 'A'),
    B: abcData.filter(s => s.classification === 'B'),
    C: abcData.filter(s => s.classification === 'C')
  };

  const totalRevenue = abcData.reduce((sum, s) => sum + s.monthlyFee, 0);

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-card-foreground">Curva ABC - Análise de Receita</h3>
      </div>

      {/* Resumo das classificações */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-success/10 border border-success/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span className="font-semibold text-success">Classe A</span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            {classificationStats.A.length} alunos (80% da receita)
          </p>
          <p className="font-bold text-success">
            R$ {classificationStats.A.reduce((sum, s) => sum + s.monthlyFee, 0).toLocaleString('pt-BR')}
          </p>
        </div>

        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-warning rounded-full"></div>
            <span className="font-semibold text-warning">Classe B</span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            {classificationStats.B.length} alunos (15% da receita)
          </p>
          <p className="font-bold text-warning">
            R$ {classificationStats.B.reduce((sum, s) => sum + s.monthlyFee, 0).toLocaleString('pt-BR')}
          </p>
        </div>

        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
            <span className="font-semibold text-muted-foreground">Classe C</span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            {classificationStats.C.length} alunos (5% da receita)
          </p>
          <p className="font-bold text-muted-foreground">
            R$ {classificationStats.C.reduce((sum, s) => sum + s.monthlyFee, 0).toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Lista detalhada dos top 10 alunos */}
      <div className="space-y-3">
        <h4 className="font-semibold text-card-foreground mb-3">Top 10 Alunos por Receita</h4>
        {abcData.slice(0, 10).map((student, index) => (
          <div
            key={student.id}
            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                <span className="text-sm font-bold text-primary">{index + 1}</span>
              </div>
              <div>
                <p className="font-medium text-card-foreground">{student.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      student.classification === 'A'
                        ? 'bg-success/20 text-success'
                        : student.classification === 'B'
                        ? 'bg-warning/20 text-warning'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    Classe {student.classification}
                  </span>
                  <span>{student.revenuePercentage.toFixed(1)}% da receita</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-card-foreground">
                R$ {student.monthlyFee.toLocaleString('pt-BR')}
              </p>
              <p className="text-sm text-muted-foreground">
                {student.cumulativePercentage.toFixed(1)}% acumulado
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Insights da Curva ABC */}
      <div className="mt-6 p-4 bg-info/10 border border-info/20 rounded-lg">
        <h4 className="font-semibold text-info mb-2">💡 Insights da Curva ABC</h4>
        <ul className="text-sm text-info space-y-1">
          <li>
            • <strong>Classe A:</strong> Seus alunos mais valiosos - merecem atenção especial e programas de retenção
          </li>
          <li>
            • <strong>Classe B:</strong> Alunos com potencial de crescimento - oportunidades de upsell
          </li>
          <li>
            • <strong>Classe C:</strong> Maioria dos alunos - foque em eficiência operacional
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ABCCurveChart;