-- Schema para Sistema de NFS-e da Prefeitura de Barueri
-- Este arquivo deve ser executado no Supabase após a criação das tabelas principais

-- Tabela para armazenar as NFS-e emitidas
CREATE TABLE public.nfse (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  numero_nfse text NOT NULL UNIQUE, -- Número sequencial da NFS-e
  codigo_verificacao text NOT NULL, -- Código de verificação da prefeitura
  payment_id uuid, -- Referência ao pagamento que originou a NFS-e
  student_id uuid, -- Referência ao aluno

  -- Dados do Prestador (Academia)
  prestador_cnpj text NOT NULL DEFAULT '12.345.678/0001-90',
  prestador_razao_social text NOT NULL DEFAULT 'ACADEMIA ESPORTIVA ACTIVE SUITE 57 LTDA',
  prestador_endereco jsonb, -- Endereço completo do prestador

  -- Dados do Tomador (Responsável)
  tomador_cpf_cnpj text NOT NULL,
  tomador_nome text NOT NULL,
  tomador_endereco jsonb NOT NULL, -- CEP, UF, cidade, logradouro, numero, complemento, bairro
  tomador_email text NOT NULL,
  tomador_estrangeiro boolean DEFAULT false,

  -- Dados do Serviço
  servico_aliquota numeric(5,2) NOT NULL, -- Ex: 2.00 para 2%
  servico_quantidade numeric(10,2) NOT NULL DEFAULT 1,
  servico_valor_unitario numeric(10,2) NOT NULL,
  servico_discriminacao text NOT NULL,
  servico_valor_nao_incluso numeric(10,2) DEFAULT 0,

  -- Retenções
  retencao_irrf numeric(10,2) DEFAULT 0,
  retencao_pis numeric(10,2) DEFAULT 0,
  retencao_cofins numeric(10,2) DEFAULT 0,
  retencao_csll numeric(10,2) DEFAULT 0,

  -- Dados da Fatura
  fatura_numero text NOT NULL,
  fatura_valor numeric(10,2) NOT NULL,
  fatura_forma_pagamento text NOT NULL,

  -- Valores Calculados
  valor_base numeric(10,2) NOT NULL, -- quantidade * valor_unitario
  valor_iss numeric(10,2) NOT NULL, -- valor_base * (aliquota/100)
  valor_total_retencoes numeric(10,2) NOT NULL,
  valor_total numeric(10,2) NOT NULL, -- valor_base + iss + valor_nao_incluso - retencoes

  -- Status e Controle
  status text NOT NULL DEFAULT 'emitida' CHECK (status IN ('emitida', 'cancelada', 'substituida')),
  data_emissao timestamp with time zone NOT NULL DEFAULT now(),
  data_cancelamento timestamp with time zone,
  motivo_cancelamento text,

  -- Dados da Resposta da Prefeitura
  xml_retorno text, -- XML de resposta da prefeitura
  protocolo_prefeitura text, -- Número do protocolo da prefeitura
  link_pdf text, -- Link para download do PDF da NFS-e

  -- Metadados
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),

  CONSTRAINT nfse_pkey PRIMARY KEY (id),
  CONSTRAINT nfse_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id),
  CONSTRAINT nfse_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);

-- Tabela para log de operações com NFS-e (auditoria)
CREATE TABLE public.nfse_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nfse_id uuid NOT NULL REFERENCES public.nfse(id),
  operacao text NOT NULL CHECK (operacao IN ('emissao', 'cancelamento', 'impressao', 'reenvio')),
  usuario_id uuid REFERENCES auth.users(id),
  data_operacao timestamp with time zone DEFAULT now(),
  detalhes jsonb, -- Dados extras da operação
  ip_address inet,
  user_agent text,

  CONSTRAINT nfse_log_pkey PRIMARY KEY (id)
);

-- Tabela para controle de numeração das NFS-e
CREATE TABLE public.nfse_numeracao (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ano integer NOT NULL,
  ultimo_numero integer NOT NULL DEFAULT 0,
  prefixo text DEFAULT 'BARUERI',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  CONSTRAINT nfse_numeracao_pkey PRIMARY KEY (id),
  CONSTRAINT nfse_numeracao_ano_unique UNIQUE (ano)
);

-- Inserir numeração inicial para o ano atual
INSERT INTO public.nfse_numeracao (ano, ultimo_numero, prefixo)
VALUES (EXTRACT(YEAR FROM NOW()), 0, 'BARUERI')
ON CONFLICT (ano) DO NOTHING;

-- Função para gerar próximo número de NFS-e
CREATE OR REPLACE FUNCTION public.gerar_proximo_numero_nfse()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ano_atual integer := EXTRACT(YEAR FROM NOW());
  proximo_numero integer;
  numero_formatado text;
BEGIN
  -- Atualizar e obter o próximo número
  UPDATE public.nfse_numeracao
  SET ultimo_numero = ultimo_numero + 1,
      updated_at = NOW()
  WHERE ano = ano_atual
  RETURNING ultimo_numero INTO proximo_numero;

  -- Se não existir registro para o ano atual, criar
  IF proximo_numero IS NULL THEN
    INSERT INTO public.nfse_numeracao (ano, ultimo_numero)
    VALUES (ano_atual, 1);
    proximo_numero := 1;
  END IF;

  -- Formatar número: AAAA + número com 6 dígitos
  numero_formatado := ano_atual::text || LPAD(proximo_numero::text, 6, '0');

  RETURN numero_formatado;
END;
$$;

-- Função para gerar código de verificação
CREATE OR REPLACE FUNCTION public.gerar_codigo_verificacao(numero_nfse text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  codigo text;
BEGIN
  -- Gerar código simples baseado no número + timestamp
  codigo := 'BARUERI' || numero_nfse || EXTRACT(EPOCH FROM NOW())::bigint::text;

  -- Retornar apenas os primeiros 20 caracteres
  RETURN SUBSTRING(codigo, 1, 20);
END;
$$;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_nfse_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER nfse_updated_at_trigger
  BEFORE UPDATE ON public.nfse
  FOR EACH ROW
  EXECUTE FUNCTION public.update_nfse_updated_at();

-- Índices para performance
CREATE INDEX idx_nfse_numero ON public.nfse(numero_nfse);
CREATE INDEX idx_nfse_payment_id ON public.nfse(payment_id);
CREATE INDEX idx_nfse_student_id ON public.nfse(student_id);
CREATE INDEX idx_nfse_status ON public.nfse(status);
CREATE INDEX idx_nfse_data_emissao ON public.nfse(data_emissao);
CREATE INDEX idx_nfse_tomador_cpf ON public.nfse(tomador_cpf_cnpj);

-- Row Level Security (RLS)
ALTER TABLE public.nfse ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfse_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfse_numeracao ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Permitir leitura de NFS-e para usuários autenticados" ON public.nfse
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção de NFS-e para usuários autenticados" ON public.nfse
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização de NFS-e para usuários autenticados" ON public.nfse
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir leitura de logs para usuários autenticados" ON public.nfse_log
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção de logs para usuários autenticados" ON public.nfse_log
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir leitura de numeração para usuários autenticados" ON public.nfse_numeracao
  FOR SELECT USING (auth.role() = 'authenticated');

-- Comentários das tabelas
COMMENT ON TABLE public.nfse IS 'Tabela para armazenar as Notas Fiscais de Serviço Eletrônicas emitidas';
COMMENT ON TABLE public.nfse_log IS 'Log de auditoria para operações com NFS-e';
COMMENT ON TABLE public.nfse_numeracao IS 'Controle de numeração sequencial das NFS-e por ano';

-- Comentários dos campos principais
COMMENT ON COLUMN public.nfse.numero_nfse IS 'Número sequencial da NFS-e no formato AAAANNNNNN';
COMMENT ON COLUMN public.nfse.codigo_verificacao IS 'Código de verificação gerado pela prefeitura';
COMMENT ON COLUMN public.nfse.tomador_endereco IS 'JSON com endereço completo: {cep, uf, cidade, logradouro, numero, complemento, bairro}';
COMMENT ON COLUMN public.nfse.servico_discriminacao IS 'Descrição detalhada do serviço prestado';
COMMENT ON COLUMN public.nfse.valor_total IS 'Valor total da nota após cálculos de ISS e retenções';

-- Views úteis para relatórios
CREATE VIEW public.view_nfse_resumo AS
SELECT
  n.id,
  n.numero_nfse,
  n.data_emissao,
  n.status,
  n.tomador_nome,
  n.tomador_cpf_cnpj,
  n.valor_total,
  s.name as student_name,
  p.month as payment_month
FROM public.nfse n
LEFT JOIN public.students s ON n.student_id = s.id
LEFT JOIN public.payments p ON n.payment_id = p.id
ORDER BY n.data_emissao DESC;

COMMENT ON VIEW public.view_nfse_resumo IS 'Visão resumida das NFS-e com dados relacionados';

-- Função para buscar NFS-e com filtros
CREATE OR REPLACE FUNCTION public.buscar_nfse(
  p_filtro_tipo text DEFAULT 'todos', -- 'aluno', 'periodo', 'numero', 'todos'
  p_valor_filtro text DEFAULT '',
  p_data_inicio date DEFAULT NULL,
  p_data_fim date DEFAULT NULL,
  p_status text DEFAULT 'todos'
)
RETURNS TABLE (
  id uuid,
  numero_nfse text,
  data_emissao timestamp with time zone,
  status text,
  tomador_nome text,
  tomador_cpf_cnpj text,
  valor_total numeric,
  student_name text,
  payment_month text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.numero_nfse,
    v.data_emissao,
    v.status,
    v.tomador_nome,
    v.tomador_cpf_cnpj,
    v.valor_total,
    v.student_name,
    v.payment_month
  FROM public.view_nfse_resumo v
  WHERE
    (p_status = 'todos' OR v.status = p_status)
    AND (
      p_filtro_tipo = 'todos' OR
      (p_filtro_tipo = 'aluno' AND LOWER(v.student_name) LIKE LOWER('%' || p_valor_filtro || '%')) OR
      (p_filtro_tipo = 'numero' AND v.numero_nfse LIKE '%' || p_valor_filtro || '%') OR
      (p_filtro_tipo = 'periodo' AND v.data_emissao::date BETWEEN COALESCE(p_data_inicio, '1900-01-01') AND COALESCE(p_data_fim, '2100-12-31'))
    )
  ORDER BY v.data_emissao DESC;
END;
$$;

COMMENT ON FUNCTION public.buscar_nfse IS 'Função para buscar NFS-e com diversos filtros';