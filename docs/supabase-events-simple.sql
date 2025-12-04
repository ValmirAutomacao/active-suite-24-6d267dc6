-- Script simplificado para ajustar tabelas de eventos no Supabase
-- Execute este script se o script principal der erro

-- 1. Criar enum para tipos de evento (se não existir)
CREATE TYPE IF NOT EXISTS event_type_enum AS ENUM (
    'training',
    'match',
    'evaluation',
    'meeting',
    'special',
    'inaugural'
);

-- 2. Adicionar colunas na tabela events (uma por vez para evitar conflitos)
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS modality_id UUID;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS teacher_id UUID;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS max_participants INTEGER;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_inaugural BOOLEAN DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS recurring_pattern JSONB;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS created_by UUID;

-- 3. Adicionar constraints de foreign key (se as tabelas existirem)
-- Comentar as linhas abaixo se as tabelas sports ou teachers não existirem ainda
-- ALTER TABLE public.events ADD CONSTRAINT fk_events_modality FOREIGN KEY (modality_id) REFERENCES public.sports(id);
-- ALTER TABLE public.events ADD CONSTRAINT fk_events_teacher FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);
-- ALTER TABLE public.events ADD CONSTRAINT fk_events_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- 4. Atualizar coluna event_type para usar enum (se ela já existir como texto)
-- ALTER TABLE public.events ALTER COLUMN event_type TYPE event_type_enum USING event_type::event_type_enum;

-- Ou criar a coluna se não existir
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_type event_type_enum DEFAULT 'training';

-- 5. Criar índices básicos
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_inaugural ON public.events(is_inaugural) WHERE is_inaugural = true;

-- 6. Criar tabela para participantes de eventos
CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  student_id UUID NOT NULL,
  status TEXT DEFAULT 'confirmed',
  registered_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, student_id)
);

-- 7. Adicionar foreign keys na tabela event_participants
-- ALTER TABLE public.event_participants ADD CONSTRAINT fk_event_participants_event FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;
-- ALTER TABLE public.event_participants ADD CONSTRAINT fk_event_participants_student FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- 8. Atualizar tabela inaugural_classes
ALTER TABLE public.inaugural_classes ADD COLUMN IF NOT EXISTS event_id UUID;
ALTER TABLE public.inaugural_classes ADD COLUMN IF NOT EXISTS selected_time TIME;
ALTER TABLE public.inaugural_classes ADD COLUMN IF NOT EXISTS notes TEXT;

-- 9. Habilitar RLS nas novas tabelas
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- 10. Criar políticas RLS básicas

-- Admins podem ver todos os eventos
CREATE POLICY IF NOT EXISTS "Admins can manage all events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND registration_flow = 'admin'
    )
  );

-- Eventos inaugurais são públicos
CREATE POLICY IF NOT EXISTS "Public can view inaugural events" ON public.events
  FOR SELECT USING (is_inaugural = true);

-- Políticas para event_participants
CREATE POLICY IF NOT EXISTS "Admins can manage participants" ON public.event_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND registration_flow = 'admin'
    )
  );

-- 11. Inserir alguns eventos de exemplo (opcional)
-- Descomente as linhas abaixo se quiser criar eventos de teste

/*
INSERT INTO public.events (
  title,
  description,
  date,
  start_time,
  end_time,
  event_type,
  location,
  is_inaugural,
  max_participants,
  current_participants
) VALUES
(
  'Aula Inaugural - Futebol',
  'Aula experimental gratuita de futebol',
  CURRENT_DATE + INTERVAL '7 days',
  '10:00',
  '11:00',
  'inaugural',
  'Campo Principal',
  true,
  20,
  0
),
(
  'Aula Inaugural - Natação',
  'Aula experimental gratuita de natação',
  CURRENT_DATE + INTERVAL '7 days',
  '14:00',
  '15:00',
  'inaugural',
  'Piscina',
  true,
  15,
  0
);
*/

-- 12. Comentários para documentação
COMMENT ON TABLE public.events IS 'Tabela de eventos da academia, incluindo aulas inaugurais';
COMMENT ON COLUMN public.events.is_inaugural IS 'Flag para identificar eventos de aula inaugural';
COMMENT ON COLUMN public.events.max_participants IS 'Limite máximo de participantes (null = ilimitado)';
COMMENT ON COLUMN public.events.current_participants IS 'Número atual de participantes confirmados';

COMMENT ON TABLE public.event_participants IS 'Tabela de relacionamento entre eventos e alunos participantes';