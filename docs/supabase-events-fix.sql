-- Script CORRIGIDO para ajustar tabelas de eventos no Supabase
-- Solução para o erro de conversão de enum

-- 1. Criar o enum event_type se não existir
DO $$
BEGIN
    -- Verificar se o tipo existe
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type_enum') THEN
        CREATE TYPE event_type_enum AS ENUM (
            'training',
            'match',
            'evaluation',
            'meeting',
            'special',
            'inaugural'
        );
    ELSE
        -- Se existe, tentar adicionar 'inaugural' (ignora se já existe)
        BEGIN
            ALTER TYPE event_type_enum ADD VALUE 'inaugural';
        EXCEPTION
            WHEN duplicate_object THEN
                -- Valor já existe, continuar
                NULL;
        END;
    END IF;
END $$;

-- 2. Adicionar colunas necessárias na tabela events (sem alterar event_type ainda)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_inaugural BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurring_pattern JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 3. SOLUÇÃO ALTERNATIVA: Manter event_type como TEXT com CHECK
-- Não convertemos para enum, mantemos como TEXT que já funciona
-- Apenas garantimos que os valores do enum sejam aceitos na constraint

DO $$
BEGIN
    -- Verificar se já existe constraint de event_type
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
        WHERE tc.table_name = 'events'
        AND tc.constraint_type = 'CHECK'
        AND cc.check_clause LIKE '%event_type%'
    ) THEN
        -- Se existe constraint, removê-la para adicionar nova com 'inaugural'
        ALTER TABLE public.events
        DROP CONSTRAINT IF EXISTS events_event_type_check;
    END IF;

    -- Adicionar constraint atualizada que inclui 'inaugural'
    ALTER TABLE public.events
    ADD CONSTRAINT events_event_type_check
    CHECK (event_type = ANY (ARRAY['training'::text, 'match'::text, 'evaluation'::text, 'meeting'::text, 'special'::text, 'inaugural'::text]));
END $$;

-- 4. Atualizar tabela inaugural_classes para referenciar eventos
ALTER TABLE public.inaugural_classes
ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id),
ADD COLUMN IF NOT EXISTS selected_time TIME,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 5. Criar tabela para participantes de eventos
CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('confirmed', 'pending', 'cancelled')) DEFAULT 'confirmed',
  registered_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, student_id)
);

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_events_modality_id ON public.events(modality_id);
CREATE INDEX IF NOT EXISTS idx_events_teacher_id ON public.events(teacher_id);
CREATE INDEX IF NOT EXISTS idx_events_date_time ON public.events(date, start_time);
CREATE INDEX IF NOT EXISTS idx_events_inaugural ON public.events(is_inaugural) WHERE is_inaugural = true;
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_student ON public.event_participants(student_id);

-- 7. Função para buscar eventos disponíveis para aula inaugural
CREATE OR REPLACE FUNCTION get_inaugural_events(student_age INTEGER)
RETURNS TABLE (
  event_id UUID,
  event_title TEXT,
  event_date DATE,
  event_start_time TIME,
  event_end_time TIME,
  modality_name TEXT,
  teacher_name TEXT,
  available_spots INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id as event_id,
    e.title as event_title,
    e.date as event_date,
    e.start_time as event_start_time,
    e.end_time as event_end_time,
    s.name as modality_name,
    t.fullName as teacher_name,
    COALESCE(e.max_participants - e.current_participants, 999) as available_spots
  FROM public.events e
  LEFT JOIN public.sports s ON e.modality_id = s.id
  LEFT JOIN public.teachers t ON e.teacher_id = t.id
  WHERE e.is_inaugural = true
    AND e.date >= CURRENT_DATE
    AND (s.ageRange->>'min')::integer <= student_age
    AND (s.ageRange->>'max')::integer >= student_age
    AND (e.max_participants IS NULL OR e.current_participants < e.max_participants)
  ORDER BY e.date, e.start_time;
END;
$$;

-- 8. Função para registrar aluno em evento inaugural
CREATE OR REPLACE FUNCTION register_student_inaugural_event(
  p_student_id UUID,
  p_event_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_available_spots INTEGER;
  v_result JSON;
BEGIN
  -- Verificar disponibilidade
  SELECT COALESCE(max_participants - current_participants, 999)
  INTO v_available_spots
  FROM public.events
  WHERE id = p_event_id AND is_inaugural = true;

  IF v_available_spots <= 0 THEN
    v_result := json_build_object(
      'success', false,
      'message', 'Evento lotado'
    );
    RETURN v_result;
  END IF;

  -- Registrar participante
  INSERT INTO public.event_participants (event_id, student_id, status)
  VALUES (p_event_id, p_student_id, 'confirmed')
  ON CONFLICT (event_id, student_id)
  DO UPDATE SET status = 'confirmed';

  -- Atualizar contador
  UPDATE public.events
  SET current_participants = current_participants + 1
  WHERE id = p_event_id;

  -- Atualizar tabela inaugural_classes
  UPDATE public.inaugural_classes
  SET event_id = p_event_id,
      status = 'scheduled'
  WHERE student_id = p_student_id;

  v_result := json_build_object(
    'success', true,
    'message', 'Aluno registrado com sucesso'
  );

  RETURN v_result;
END;
$$;

-- 9. Trigger para manter sincronia de participantes
CREATE OR REPLACE FUNCTION sync_event_participants()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.events
    SET current_participants = (
      SELECT COUNT(*)
      FROM public.event_participants
      WHERE event_id = NEW.event_id AND status = 'confirmed'
    )
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.events
    SET current_participants = (
      SELECT COUNT(*)
      FROM public.event_participants
      WHERE event_id = OLD.event_id AND status = 'confirmed'
    )
    WHERE id = OLD.event_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.events
    SET current_participants = (
      SELECT COUNT(*)
      FROM public.event_participants
      WHERE event_id = NEW.event_id AND status = 'confirmed'
    )
    WHERE id = NEW.event_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- 10. Criar trigger
DROP TRIGGER IF EXISTS trigger_sync_event_participants ON public.event_participants;
CREATE TRIGGER trigger_sync_event_participants
  AFTER INSERT OR UPDATE OR DELETE ON public.event_participants
  FOR EACH ROW
  EXECUTE FUNCTION sync_event_participants();

-- 11. RLS Policies para eventos
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- Policy para admins verem todos os eventos
DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;
CREATE POLICY "Admins can manage all events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND registration_flow = 'admin'
    )
  );

-- Policy para responsáveis verem apenas eventos de seus alunos
DROP POLICY IF EXISTS "Guardians can view their student events" ON public.events;
CREATE POLICY "Guardians can view their student events" ON public.events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.event_participants ep
      JOIN public.students s ON ep.student_id = s.id
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE ep.event_id = events.id
      AND s.guardian->>'email' = p.email
    )
  );

-- Policy para eventos inaugurais (público)
DROP POLICY IF EXISTS "Public can view inaugural events" ON public.events;
CREATE POLICY "Public can view inaugural events" ON public.events
  FOR SELECT USING (is_inaugural = true);

-- Policies para event_participants
DROP POLICY IF EXISTS "Admins can manage participants" ON public.event_participants;
CREATE POLICY "Admins can manage participants" ON public.event_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND registration_flow = 'admin'
    )
  );

DROP POLICY IF EXISTS "Guardians can view their participations" ON public.event_participants;
CREATE POLICY "Guardians can view their participations" ON public.event_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students s
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE s.id = event_participants.student_id
      AND s.guardian->>'email' = p.email
    )
  );

-- 12. Comentários para documentação
COMMENT ON TABLE public.events IS 'Tabela de eventos da academia, incluindo aulas inaugurais';
COMMENT ON COLUMN public.events.is_inaugural IS 'Flag para identificar eventos de aula inaugural';
COMMENT ON COLUMN public.events.recurring_pattern IS 'JSON com padrão de recorrência: {type: "weekly", days: ["monday", "wednesday"], end_date: "2024-12-31"}';
COMMENT ON COLUMN public.events.max_participants IS 'Limite máximo de participantes (null = ilimitado)';
COMMENT ON COLUMN public.events.current_participants IS 'Número atual de participantes confirmados';

COMMENT ON TABLE public.event_participants IS 'Tabela de relacionamento entre eventos e alunos participantes';
COMMENT ON FUNCTION get_inaugural_events IS 'Busca eventos inaugurais disponíveis baseado na idade do aluno';
COMMENT ON FUNCTION register_student_inaugural_event IS 'Registra aluno em evento inaugural e atualiza contadores';

-- SUCESSO: Script executado sem erros!
SELECT 'Sistema de eventos implementado com sucesso!' as resultado;