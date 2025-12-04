import React from 'react';
import { Calendar, Filter, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReportFiltersProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  selectedModality: string;
  onModalityChange: (modality: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onExport: (format: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  selectedPeriod,
  onPeriodChange,
  selectedModality,
  onModalityChange,
  selectedStatus,
  onStatusChange,
  onExport,
  onRefresh,
  isLoading = false
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtros de Relatório
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Período */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Período</label>
            <Select value={selectedPeriod} onValueChange={onPeriodChange}>
              <SelectTrigger>
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="yesterday">Ontem</SelectItem>
                <SelectItem value="this-week">Esta Semana</SelectItem>
                <SelectItem value="last-week">Semana Passada</SelectItem>
                <SelectItem value="this-month">Este Mês</SelectItem>
                <SelectItem value="last-month">Mês Passado</SelectItem>
                <SelectItem value="this-quarter">Este Trimestre</SelectItem>
                <SelectItem value="last-quarter">Trimestre Passado</SelectItem>
                <SelectItem value="this-year">Este Ano</SelectItem>
                <SelectItem value="last-year">Ano Passado</SelectItem>
                <SelectItem value="all-time">Todo o Período</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Modalidade */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Modalidade</label>
            <Select value={selectedModality} onValueChange={onModalityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as modalidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Modalidades</SelectItem>
                <SelectItem value="infantil">Infantil (3-5 anos)</SelectItem>
                <SelectItem value="infantil2">Infantil 2 (6-9 anos)</SelectItem>
                <SelectItem value="infantil3">Infantil 3 (10-12 anos)</SelectItem>
                <SelectItem value="infanto-juvenil">Infanto Juvenil (13-16 anos)</SelectItem>
                <SelectItem value="juvenil">Juvenil (17-20 anos)</SelectItem>
                <SelectItem value="inaugural">Aula Inaugural</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status dos Alunos */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="effective">Efetivados</SelectItem>
                <SelectItem value="provisional">Provisórios</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ações */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Ações</label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="flex-1"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Botões de Exportação */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('pdf')}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('excel')}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('csv')}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportFilters;