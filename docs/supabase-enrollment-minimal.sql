-- SCRIPT MÍNIMO PARA SUPORTE A MATRÍCULA
-- Execute este script no Supabase Dashboard > SQL Editor
-- Baseado no schema atual existente

-- 1. Adicionar colunas que faltam na tabela students
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS enrollment_fee DECIMAL(10,2) DEFAULT 50.00,
ADD COLUMN IF NOT EXISTS payment_due_date INTEGER DEFAULT 5;

-- 2. Criar tabela enrollments (única tabela que falta)
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    modality_id UUID,
    status VARCHAR(20) DEFAULT 'active',
    monthly_fee DECIMAL(10,2),
    enrollment_fee DECIMAL(10,2),
    payment_due_date INTEGER DEFAULT 5,
    payment_method VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS na tabela enrollments
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS para enrollments (permissivas para teste)
DO $$
BEGIN
    -- Remover política se existir
    DROP POLICY IF EXISTS "Allow all operations on enrollments" ON public.enrollments;

    -- Criar nova política
    CREATE POLICY "Allow all operations on enrollments" ON public.enrollments
    FOR ALL USING (true) WITH CHECK (true);

EXCEPTION
    WHEN duplicate_object THEN
        -- Política já existe, continuar
        NULL;
END $$;

-- 5. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);

-- 6. Verificar se tudo foi criado
SELECT 'Enrollment setup completed successfully' as result;

-- 7. Verificar estrutura da tabela enrollments
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'enrollments'
ORDER BY ordinal_position;