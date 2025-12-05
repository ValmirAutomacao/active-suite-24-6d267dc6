import React, { useState } from 'react';
import { BarChart3, TrendingUp, PieChart, Download, Calendar, Filter } from 'lucide-react';
import { useStudentsABCCurve, useDashboardMetrics, useStudentsByModality } from '@/hooks/useReports';
import ABCCurveChart from '@/components/reports/ABCCurveChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: abcData, isLoading: abcLoading } = useStudentsABCCurve();
  const { data: modalityData, isLoading: modalityLoading } = useStudentsByModality();

  const exportReport = (reportType: string) => {
    // TODO: Implementar exportação de relatórios
    console.log(`Exportando relatório: ${reportType}`);
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Relatórios e Analytics</h1>
          <p className="text-muted-foreground">
            Análises detalhadas e insights sobre o desempenho da academia
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Mês Atual</SelectItem>
              <SelectItem value="last-month">Mês Anterior</SelectItem>
              <SelectItem value="quarter">Último Trimestre</SelectItem>
              <SelectItem value="year">Ano Atual</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricsLoading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="w-24 h-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="w-16 h-8 mb-2" />
                <Skeleton className="w-20 h-3" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Taxa de Retenção
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {((metrics?.activeStudents || 0) / (metrics?.totalStudents || 1) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-success">+2.3% vs mês anterior</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Receita por Aluno
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  R$ {((metrics?.monthlyRevenue || 0) / (metrics?.activeStudents || 1)).toFixed(0)}
                </div>
                <p className="text-xs text-info">Média mensal</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Taxa de Conversão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {((metrics?.effectiveStudents || 0) / (metrics?.provisionalStudents || 1) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-warning">Provisional → Efetivo</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Crescimento Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  +{metrics?.newStudentsThisMonth || 0}
                </div>
                <p className="text-xs text-primary">Novos alunos</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* ABC Curve */}
        <div className="xl:col-span-2">
          <ABCCurveChart />
        </div>

        {/* Revenue Distribution by Modality */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Receita por Modalidade
            </CardTitle>
            <CardDescription>
              Distribuição da receita mensal entre as modalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            {modalityLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-16 h-4" />
                  </div>
                ))}
              </div>
            ) : modalityData && modalityData.length > 0 ? (
              <div className="space-y-4">
                {modalityData.map((modality, index) => {
                  // Estimate revenue based on count and average fee
                  const estimatedRevenue = modality.count * 150; // R$150 average
                  const maxRevenue = Math.max(...modalityData.map(m => m.count * 150));
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{modality.name}</span>
                        <span className="text-sm font-bold">R$ {estimatedRevenue.toFixed(0)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${(estimatedRevenue / maxRevenue) * 100}%`
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{modality.count} alunos</span>
                        <span>R$ {modality.count > 0 ? (estimatedRevenue / modality.count).toFixed(0) : 0}/aluno</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <PieChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum dado de modalidade disponível</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Distribuição de Alunos
            </CardTitle>
            <CardDescription>
              Status dos alunos na academia
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="w-16 h-4" />
                      <Skeleton className="w-8 h-4" />
                    </div>
                    <Skeleton className="w-full h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-success">Ativos</span>
                    <span className="text-sm font-bold">{metrics?.activeStudents || 0}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-success h-2 rounded-full transition-all"
                      style={{
                        width: `${((metrics?.activeStudents || 0) / (metrics?.totalStudents || 1)) * 100}%`
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-info">Efetivados</span>
                    <span className="text-sm font-bold">{metrics?.effectiveStudents || 0}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-info h-2 rounded-full transition-all"
                      style={{
                        width: `${((metrics?.effectiveStudents || 0) / (metrics?.totalStudents || 1)) * 100}%`
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-warning">Provisórios</span>
                    <span className="text-sm font-bold">{metrics?.provisionalStudents || 0}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-warning h-2 rounded-full transition-all"
                      style={{
                        width: `${((metrics?.provisionalStudents || 0) / (metrics?.totalStudents || 1)) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Insights e Recomendações
          </CardTitle>
          <CardDescription>
            Análises automáticas baseadas nos dados da academia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-card-foreground">🎯 Oportunidades de Crescimento</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-success">•</span>
                  <span>
                    <strong>{metrics?.provisionalStudents || 0} alunos provisórios</strong> podem ser convertidos em efetivos
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-info">•</span>
                  <span>
                    Receita média por aluno: <strong>R$ {((metrics?.monthlyRevenue || 0) / (metrics?.activeStudents || 1)).toFixed(0)}</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning">•</span>
                  <span>
                    Foque nos <strong>alunos Classe A</strong> da curva ABC para maximizar retenção
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-card-foreground">📊 Métricas de Performance</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    Taxa de retenção: <strong>{((metrics?.activeStudents || 0) / (metrics?.totalStudents || 1) * 100).toFixed(1)}%</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary">•</span>
                  <span>
                    Crescimento mensal: <strong>+{metrics?.newStudentsThisMonth || 0} alunos</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">•</span>
                  <span>
                    Potencial de receita mensal: <strong>R$ {(metrics?.monthlyRevenue || 0).toLocaleString('pt-BR')}</strong>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;