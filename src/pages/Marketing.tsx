import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Eye, Send, Calendar, User, CheckCircle, XCircle, Clock, Upload, Video, Image as ImageIcon, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import StatusBadge from '@/components/shared/StatusBadge';

// Mock data para campanhas de marketing
const mockCampaigns = [
  {
    id: 'camp-001',
    title: 'Promoção Verão 2024',
    description: 'Campanha especial para matrículas de verão com desconto de 30% na primeira mensalidade',
    image: '/src/imagem/campanha01.jpg',
    video: null,
    createdAt: '2024-10-15',
    sentAt: '2024-10-16',
    status: 'sent',
    approvalStatus: 'approved',
    approvalNotes: 'Campanha aprovada. Ótimo conceito visual.',
    socialMedia: ['instagram', 'facebook', 'whatsapp'],
    createdBy: 'maria.santos@activesuite.com',
    approvedBy: 'gerente@activesuite.com'
  },
  {
    id: 'camp-002',
    title: 'Black Friday Academia',
    description: 'Ofertas imperdíveis para novos alunos: 50% off na matrícula + kit esportivo grátis',
    image: '/src/imagem/campanha02.jpg',
    video: null,
    createdAt: '2024-10-20',
    sentAt: null,
    status: 'pending',
    approvalStatus: 'pending',
    approvalNotes: '',
    socialMedia: ['instagram', 'facebook', 'site'],
    createdBy: 'pedro.marketing@activesuite.com',
    approvedBy: null
  },
  {
    id: 'camp-003',
    title: 'Aulas Inaugurais Dezembro',
    description: 'Convite especial para aulas inaugurais gratuitas de todas as modalidades esportivas',
    image: '/src/imagem/campanha03.jpeg',
    video: null,
    createdAt: '2024-10-25',
    sentAt: null,
    status: 'draft',
    approvalStatus: 'rejected',
    approvalNotes: 'Revisar as cores da campanha. O texto precisa ser mais chamativo.',
    socialMedia: ['instagram', 'whatsapp'],
    createdBy: 'ana.criativa@activesuite.com',
    approvedBy: 'gerente@activesuite.com'
  }
];

const socialMediaOptions = [
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'facebook', label: 'Facebook', icon: '👥' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { id: 'site', label: 'Site', icon: '🌐' }
];

type Campaign = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  video: string | null;
  createdAt: string;
  sentAt: string | null;
  status: 'draft' | 'pending' | 'sent';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvalNotes: string;
  socialMedia: string[];
  createdBy: string;
  approvedBy: string | null;
};

const Marketing: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchValue, setSearchValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'pending' | 'sent'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states for new campaign
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    description: '',
    image: null as File | null,
    video: null as File | null,
    socialMedia: [] as string[],
    recipientEmail: '',
    recipientPhone: ''
  });

  // Approval form states
  const [approvalData, setApprovalData] = useState({
    status: 'pending' as 'approved' | 'rejected',
    notes: ''
  });

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    let filtered = mockCampaigns;

    if (searchValue) {
      filtered = filtered.filter(campaign =>
        campaign.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === statusFilter);
    }

    if (startDate && endDate) {
      filtered = filtered.filter(campaign => {
        const campaignDate = new Date(campaign.createdAt);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return campaignDate >= start && campaignDate <= end;
      });
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [searchValue, statusFilter, startDate, endDate]);

  const handleCreateCampaign = async () => {
    try {
      setIsLoading(true);

      if (!newCampaign.title || !newCampaign.description) {
        toast({
          title: "Erro",
          description: "Título e descrição são obrigatórios",
          variant: "destructive"
        });
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const campaign: Campaign = {
        id: `camp-${Date.now()}`,
        title: newCampaign.title,
        description: newCampaign.description,
        image: newCampaign.image ? `/src/imagem/${newCampaign.image.name}` : null,
        video: newCampaign.video ? `/videos/${newCampaign.video.name}` : null,
        createdAt: new Date().toISOString().split('T')[0],
        sentAt: null,
        status: 'draft',
        approvalStatus: 'pending',
        approvalNotes: '',
        socialMedia: newCampaign.socialMedia,
        createdBy: 'usuario@activesuite.com',
        approvedBy: null
      };

      mockCampaigns.unshift(campaign);

      toast({
        title: "Campanha Criada",
        description: "Campanha salva como rascunho com sucesso",
        variant: "default"
      });

      setIsCreateDialogOpen(false);
      setNewCampaign({
        title: '',
        description: '',
        image: null,
        video: null,
        socialMedia: [],
        recipientEmail: '',
        recipientPhone: ''
      });

    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a campanha",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendForApproval = async (campaignId: string) => {
    try {
      setIsLoading(true);

      if (!newCampaign.recipientEmail) {
        toast({
          title: "Erro",
          description: "Email do aprovador é obrigatório",
          variant: "destructive"
        });
        return;
      }

      // Simulate sending email
      await new Promise(resolve => setTimeout(resolve, 2000));

      const campaignIndex = mockCampaigns.findIndex(c => c.id === campaignId);
      if (campaignIndex !== -1) {
        mockCampaigns[campaignIndex].status = 'pending';
      }

      toast({
        title: "Enviado para Aprovação",
        description: `Email enviado para ${newCampaign.recipientEmail}`,
        variant: "default"
      });

      setIsCreateDialogOpen(false);

    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar para aprovação",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovalSubmit = async () => {
    try {
      setIsLoading(true);

      if (!selectedCampaign) return;

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const campaignIndex = mockCampaigns.findIndex(c => c.id === selectedCampaign.id);
      if (campaignIndex !== -1) {
        mockCampaigns[campaignIndex].approvalStatus = approvalData.status;
        mockCampaigns[campaignIndex].approvalNotes = approvalData.notes;
        mockCampaigns[campaignIndex].approvedBy = 'gerente@activesuite.com';

        if (approvalData.status === 'approved') {
          mockCampaigns[campaignIndex].status = 'sent';
          mockCampaigns[campaignIndex].sentAt = new Date().toISOString().split('T')[0];
        }
      }

      toast({
        title: approvalData.status === 'approved' ? "Campanha Aprovada" : "Campanha Rejeitada",
        description: approvalData.status === 'approved'
          ? "Campanha aprovada e enviada automaticamente"
          : "Campanha rejeitada. Feedback enviado ao criador.",
        variant: "default"
      });

      setIsApprovalDialogOpen(false);
      setApprovalData({ status: 'pending', notes: '' });

    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível processar a aprovação",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialMediaChange = (socialMediaId: string, checked: boolean) => {
    if (checked) {
      setNewCampaign(prev => ({
        ...prev,
        socialMedia: [...prev.socialMedia, socialMediaId]
      }));
    } else {
      setNewCampaign(prev => ({
        ...prev,
        socialMedia: prev.socialMedia.filter(id => id !== socialMediaId)
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'pending': return <Clock className="w-4 h-4 text-warning" />;
      case 'draft': return <XCircle className="w-4 h-4 text-muted-foreground" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-success-foreground">Aprovada</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive text-destructive-foreground">Rejeitada</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">Pendente</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground">-</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Marketing</h1>
          <p className="text-muted-foreground">
            Gestão de campanhas e criativos para divulgação
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Criar Campanha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Campanha de Marketing</DialogTitle>
              <DialogDescription>
                Crie uma nova campanha publicitária para divulgação nas mídias sociais
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Campanha *</Label>
                  <Input
                    id="title"
                    placeholder="Digite o título da campanha..."
                    value={newCampaign.title}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva os detalhes da campanha..."
                    rows={4}
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Imagem do Criativo</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <div className="mt-2">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setNewCampaign(prev => ({
                            ...prev,
                            image: e.target.files?.[0] || null
                          }))}
                          className="hidden"
                        />
                        <Label htmlFor="image" className="cursor-pointer">
                          <span className="text-sm text-muted-foreground">
                            Clique para fazer upload da imagem
                          </span>
                        </Label>
                      </div>
                    </div>
                  </div>
                  {newCampaign.image && (
                    <p className="text-sm text-muted-foreground">
                      Arquivo selecionado: {newCampaign.image.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video">Vídeo (Opcional)</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                    <div className="text-center">
                      <Video className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <div className="mt-2">
                        <Input
                          id="video"
                          type="file"
                          accept="video/*"
                          onChange={(e) => setNewCampaign(prev => ({
                            ...prev,
                            video: e.target.files?.[0] || null
                          }))}
                          className="hidden"
                        />
                        <Label htmlFor="video" className="cursor-pointer">
                          <span className="text-sm text-muted-foreground">
                            Clique para fazer upload do vídeo
                          </span>
                        </Label>
                      </div>
                    </div>
                  </div>
                  {newCampaign.video && (
                    <p className="text-sm text-muted-foreground">
                      Arquivo selecionado: {newCampaign.video.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Mídias Sociais *</Label>
                  <div className="space-y-3">
                    {socialMediaOptions.map((social) => (
                      <div key={social.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={social.id}
                          checked={newCampaign.socialMedia.includes(social.id)}
                          onCheckedChange={(checked) => handleSocialMediaChange(social.id, checked as boolean)}
                        />
                        <Label htmlFor={social.id} className="flex items-center gap-2 cursor-pointer">
                          <span>{social.icon}</span>
                          {social.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">Email do Aprovador</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="recipientEmail"
                      type="email"
                      placeholder="gerente@activesuite.com"
                      value={newCampaign.recipientEmail}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, recipientEmail: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipientPhone">Telefone (Opcional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="recipientPhone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={newCampaign.recipientPhone}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, recipientPhone: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Resumo da Campanha</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><strong>Título:</strong> {newCampaign.title || 'Não informado'}</p>
                      <p><strong>Mídias:</strong> {newCampaign.socialMedia.length > 0
                        ? newCampaign.socialMedia.map(id => socialMediaOptions.find(s => s.id === id)?.label).join(', ')
                        : 'Nenhuma selecionada'
                      }</p>
                      <p><strong>Arquivos:</strong> {
                        [newCampaign.image && 'Imagem', newCampaign.video && 'Vídeo']
                          .filter(Boolean).join(', ') || 'Nenhum arquivo'
                      }</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={handleCreateCampaign}
                disabled={isLoading}
              >
                Salvar Rascunho
              </Button>
              <Button
                onClick={() => handleSendForApproval('new')}
                disabled={isLoading || !newCampaign.recipientEmail}
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar p/ Aprovação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Busca
          </CardTitle>
          <CardDescription>
            Pesquise campanhas por título, período ou status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Buscar Campanha</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Digite o título..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="sent">Enviado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Data Final</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchValue('');
                  setStartDate('');
                  setEndDate('');
                  setStatusFilter('all');
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Campanhas ({filteredCampaigns.length})
          </CardTitle>
          <CardDescription>
            Lista de todas as campanhas criadas e seus status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCampaigns.map(campaign => (
              <div key={campaign.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-foreground">{campaign.title}</h3>
                      {getStatusIcon(campaign.status)}
                      <StatusBadge status={campaign.status} size="sm" />
                      {getApprovalStatusBadge(campaign.approvalStatus)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {campaign.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
                      <div>
                        <strong>Criado em:</strong><br />
                        {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                      <div>
                        <strong>Criado por:</strong><br />
                        {campaign.createdBy}
                      </div>
                      <div>
                        <strong>Enviado em:</strong><br />
                        {campaign.sentAt ? new Date(campaign.sentAt).toLocaleDateString('pt-BR') : 'Não enviado'}
                      </div>
                      <div>
                        <strong>Mídias:</strong><br />
                        {campaign.socialMedia.map(id =>
                          socialMediaOptions.find(s => s.id === id)?.icon
                        ).join(' ')}
                      </div>
                    </div>

                    {campaign.approvalNotes && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <strong className="text-xs">Observações:</strong>
                        <p className="text-sm text-muted-foreground mt-1">{campaign.approvalNotes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {campaign.image && (
                      <img
                        src={campaign.image}
                        alt={campaign.title}
                        className="w-20 h-20 object-cover rounded border"
                      />
                    )}

                    {campaign.approvalStatus === 'pending' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedCampaign(campaign);
                              setApprovalData({ status: 'pending', notes: '' });
                            }}
                          >
                            Aprovar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Aprovar Campanha</DialogTitle>
                            <DialogDescription>
                              Avalie a campanha "{campaign.title}" e forneça seu feedback
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Decisão</Label>
                              <Select
                                value={approvalData.status}
                                onValueChange={(value) => setApprovalData(prev => ({ ...prev, status: value as any }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="approved">✅ Aprovado</SelectItem>
                                  <SelectItem value="rejected">❌ Reprovado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Observações</Label>
                              <Textarea
                                placeholder="Digite suas observações sobre a campanha..."
                                value={approvalData.notes}
                                onChange={(e) => setApprovalData(prev => ({ ...prev, notes: e.target.value }))}
                                rows={3}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={handleApprovalSubmit}
                              disabled={isLoading}
                            >
                              Salvar Aprovação
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredCampaigns.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma campanha encontrada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Marketing;