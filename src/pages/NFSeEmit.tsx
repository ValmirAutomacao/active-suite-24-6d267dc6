import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Save, FileText, Calculator } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { mockPayments } from '@/data/mockPayments';
import { mockStudents } from '@/data/mockStudents';

// Alíquotas padrão de Barueri
const ALIQUOTAS = [
  { value: '2', label: '2% - Serviços em geral' },
  { value: '3', label: '3% - Construção civil' },
  { value: '5', label: '5% - Outros serviços' }
];

const FORMAS_PAGAMENTO = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'pix', label: 'PIX' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'transferencia', label: 'Transferência Bancária' }
];

const NFSeEmit: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId');

  // Estados do formulário
  const [payment, setPayment] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [isEstrangeiro, setIsEstrangeiro] = useState(false);

  // Dados do tomador (responsável)
  const [tomadorData, setTomadorData] = useState({
    cpf: '',
    nome: '',
    cep: '',
    uf: '',
    cidade: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    email: ''
  });

  // Dados do serviço
  const [servicoData, setServicoData] = useState({
    aliquota: '2',
    quantidade: '1',
    valorUnitario: '0',
    discriminacao: 'Mensalidade de treino de futebol - mês de ',
    valorNaoIncluso: '0'
  });

  // Retenções
  const [retencoes, setRetencoes] = useState({
    irrf: '0',
    pis: '0',
    cofins: '0',
    csll: '0'
  });

  // Dados da fatura
  const [fatura, setFatura] = useState({
    numero: '',
    valor: '0',
    formaPagamento: 'pix'
  });

  // Carregar dados do pagamento
  useEffect(() => {
    if (paymentId) {
      const foundPayment = mockPayments.find(p => p.id === paymentId);
      if (foundPayment) {
        setPayment(foundPayment);

        const foundStudent = mockStudents.find(s => s.name === foundPayment.studentName);
        if (foundStudent) {
          setStudent(foundStudent);

          // Preencher dados do tomador (responsável)
          setTomadorData({
            cpf: foundStudent.guardian.cpf,
            nome: foundStudent.guardian.name,
            cep: foundStudent.address.zipCode,
            uf: foundStudent.address.state,
            cidade: foundStudent.address.city,
            logradouro: foundStudent.address.street,
            numero: foundStudent.address.number,
            complemento: foundStudent.address.complement || '',
            bairro: foundStudent.address.neighborhood,
            email: foundStudent.guardian.email
          });

          // Preencher dados do serviço
          setServicoData(prev => ({
            ...prev,
            valorUnitario: foundPayment.amount.toString(),
            discriminacao: `Mensalidade de treino de futebol - ${foundPayment.sport} - ${foundPayment.month}`
          }));

          // Preencher dados da fatura
          setFatura(prev => ({
            ...prev,
            numero: foundPayment.id.replace('pay-', 'FAT-'),
            valor: foundPayment.amount.toString()
          }));
        }
      }
    }
  }, [paymentId]);

  // Calcular valores
  const valorTotal = useMemo(() => {
    const valorBase = parseFloat(servicoData.valorUnitario) * parseFloat(servicoData.quantidade);
    const aliquotaPercent = parseFloat(servicoData.aliquota) / 100;
    const iss = valorBase * aliquotaPercent;
    const valorNaoIncluso = parseFloat(servicoData.valorNaoIncluso);
    const totalRetencoes = Object.values(retencoes).reduce((sum, val) => sum + parseFloat(val || '0'), 0);

    return {
      valorBase,
      iss,
      valorNaoIncluso,
      totalRetencoes,
      total: valorBase + iss + valorNaoIncluso - totalRetencoes
    };
  }, [servicoData, retencoes]);

  const handleEmitir = () => {
    // TODO: Implementar emissão real da NFS-e
    console.log('Emitindo NFS-e com dados:', {
      payment,
      tomadorData,
      servicoData,
      retencoes,
      fatura,
      valorTotal
    });

    // Navegar de volta para a lista
    navigate('/nfs-e');
  };

  if (!payment) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p>Carregando dados do pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/nfs-e')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Emitir Nota Fiscal Eletrônica</h1>
          <p className="text-muted-foreground">Prefeitura de Barueri - NFS-e</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Prestador de Serviço */}
          <Card>
            <CardHeader>
              <CardTitle>Prestador de Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">CNPJ:</Label>
                  <p className="font-medium">12.345.678/0001-90</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Razão Social:</Label>
                  <p className="font-medium">ACADEMIA ESPORTIVA ACTIVE SUITE 57 LTDA</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Endereço:</Label>
                  <p className="font-medium">Rua dos Esportes, 123 - Centro - Barueri/SP</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Telefone:</Label>
                  <p className="font-medium">(11) 4444-5555</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tomador de Serviço */}
          <Card>
            <CardHeader>
              <CardTitle>Tomador de Serviço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="estrangeiro"
                  checked={isEstrangeiro}
                  onCheckedChange={setIsEstrangeiro}
                />
                <Label htmlFor="estrangeiro">Marque aqui se o tomador for estrangeiro</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cpf">CPF/CNPJ</Label>
                  <Input
                    id="cpf"
                    value={tomadorData.cpf}
                    onChange={(e) => setTomadorData(prev => ({ ...prev, cpf: e.target.value }))}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <Label htmlFor="nome">Nome/Razão Social</Label>
                  <Input
                    id="nome"
                    value={tomadorData.nome}
                    onChange={(e) => setTomadorData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={tomadorData.cep}
                    onChange={(e) => setTomadorData(prev => ({ ...prev, cep: e.target.value }))}
                    placeholder="00000-000"
                  />
                </div>
                <div>
                  <Label htmlFor="uf">UF</Label>
                  <Input
                    id="uf"
                    value={tomadorData.uf}
                    onChange={(e) => setTomadorData(prev => ({ ...prev, uf: e.target.value }))}
                    placeholder="SP"
                  />
                </div>
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={tomadorData.cidade}
                    onChange={(e) => setTomadorData(prev => ({ ...prev, cidade: e.target.value }))}
                    placeholder="Cidade"
                  />
                </div>
                <div>
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <Input
                    id="logradouro"
                    value={tomadorData.logradouro}
                    onChange={(e) => setTomadorData(prev => ({ ...prev, logradouro: e.target.value }))}
                    placeholder="Rua, Avenida..."
                  />
                </div>
                <div>
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={tomadorData.numero}
                    onChange={(e) => setTomadorData(prev => ({ ...prev, numero: e.target.value }))}
                    placeholder="123"
                  />
                </div>
                <div>
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={tomadorData.complemento}
                    onChange={(e) => setTomadorData(prev => ({ ...prev, complemento: e.target.value }))}
                    placeholder="Apt, Bloco..."
                  />
                </div>
                <div>
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={tomadorData.bairro}
                    onChange={(e) => setTomadorData(prev => ({ ...prev, bairro: e.target.value }))}
                    placeholder="Bairro"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email para envio da NF-e</Label>
                  <Input
                    id="email"
                    type="email"
                    value={tomadorData.email}
                    onChange={(e) => setTomadorData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Utilize ; caso queira enviar para mais de um e-mail
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Serviço */}
          <Card>
            <CardHeader>
              <CardTitle>Serviço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="aliquota">Alíquota</Label>
                  <Select value={servicoData.aliquota} onValueChange={(value) => setServicoData(prev => ({ ...prev, aliquota: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALIQUOTAS.map(aliquota => (
                        <SelectItem key={aliquota.value} value={aliquota.value}>
                          {aliquota.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantidade">Quantidade</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    value={servicoData.quantidade}
                    onChange={(e) => setServicoData(prev => ({ ...prev, quantidade: e.target.value }))}
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label htmlFor="valorUnitario">Valor Unitário</Label>
                  <Input
                    id="valorUnitario"
                    type="number"
                    step="0.01"
                    value={servicoData.valorUnitario}
                    onChange={(e) => setServicoData(prev => ({ ...prev, valorUnitario: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="discriminacao">Discriminação do Serviço Prestado</Label>
                <Textarea
                  id="discriminacao"
                  value={servicoData.discriminacao}
                  onChange={(e) => setServicoData(prev => ({ ...prev, discriminacao: e.target.value }))}
                  placeholder="Descrição detalhada do serviço..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="valorNaoIncluso">Valor não incluso na base de cálculo (Exceto Tributos Federais)</Label>
                <Input
                  id="valorNaoIncluso"
                  type="number"
                  step="0.01"
                  value={servicoData.valorNaoIncluso}
                  onChange={(e) => setServicoData(prev => ({ ...prev, valorNaoIncluso: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </CardContent>
          </Card>

          {/* Retenções */}
          <Card>
            <CardHeader>
              <CardTitle>Retenções</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="irrf">IRRF</Label>
                  <Input
                    id="irrf"
                    type="number"
                    step="0.01"
                    value={retencoes.irrf}
                    onChange={(e) => setRetencoes(prev => ({ ...prev, irrf: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="pis">PIS/PASEP</Label>
                  <Input
                    id="pis"
                    type="number"
                    step="0.01"
                    value={retencoes.pis}
                    onChange={(e) => setRetencoes(prev => ({ ...prev, pis: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="cofins">COFINS</Label>
                  <Input
                    id="cofins"
                    type="number"
                    step="0.01"
                    value={retencoes.cofins}
                    onChange={(e) => setRetencoes(prev => ({ ...prev, cofins: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="csll">CSLL</Label>
                  <Input
                    id="csll"
                    type="number"
                    step="0.01"
                    value={retencoes.csll}
                    onChange={(e) => setRetencoes(prev => ({ ...prev, csll: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados da Fatura */}
          <Card>
            <CardHeader>
              <CardTitle>Dados da Fatura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="numeroFatura">Nº da Fatura</Label>
                  <Input
                    id="numeroFatura"
                    value={fatura.numero}
                    onChange={(e) => setFatura(prev => ({ ...prev, numero: e.target.value }))}
                    placeholder="FAT-001"
                  />
                </div>
                <div>
                  <Label htmlFor="valorFatura">Valor da Fatura</Label>
                  <Input
                    id="valorFatura"
                    type="number"
                    step="0.01"
                    value={fatura.valor}
                    onChange={(e) => setFatura(prev => ({ ...prev, valor: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                  <Select value={fatura.formaPagamento} onValueChange={(value) => setFatura(prev => ({ ...prev, formaPagamento: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMAS_PAGAMENTO.map(forma => (
                        <SelectItem key={forma.value} value={forma.value}>
                          {forma.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo e Total */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Resumo da Nota
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Valor Base:</span>
                <span>R$ {valorTotal.valorBase.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>ISS ({servicoData.aliquota}%):</span>
                <span>R$ {valorTotal.iss.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Valor Não Incluso:</span>
                <span>R$ {valorTotal.valorNaoIncluso.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Retenções:</span>
                <span>R$ {valorTotal.totalRetencoes.toFixed(2)}</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>TOTAL DA NOTA:</span>
                <span className="text-primary">R$ {valorTotal.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  onClick={handleEmitir}
                  className="w-full"
                  size="lg"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Emitir NFS-e
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/nfs-e')}
                  className="w-full"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NFSeEmit;