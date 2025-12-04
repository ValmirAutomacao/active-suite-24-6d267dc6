-- SCRIPT PARA CONFIGURAR SISTEMA DE MATRÍCULA NO SUPABASE
-- Execute este script no Supabase Dashboard > SQL Editor

-- 1. Verificar se constraint profiles_registration_flow permite 'enrollment'
DO $$
BEGIN
    -- Remover constraint antiga se existir
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'profiles_registration_flow_check'
        AND conrelid = 'public.profiles'::regclass
    ) THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_registration_flow_check;
    END IF;

    -- Adicionar constraint atualizada
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_registration_flow_check
    CHECK (registration_flow IN ('inaugural', 'enrollment', 'admin'));
END $$;

-- 2. Adicionar colunas de pagamento na tabela students se não existirem
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS monthly_fee DECIMAL(10,2) DEFAULT 150.00,
ADD COLUMN IF NOT EXISTS enrollment_fee DECIMAL(10,2) DEFAULT 50.00,
ADD COLUMN IF NOT EXISTS payment_due_date INTEGER DEFAULT 5;

-- 3. Criar tabela enrollments se não existir
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

-- 4. Habilitar RLS na tabela enrollments
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS para enrollments
CREATE POLICY IF NOT EXISTS "Users can view enrollments" ON public.enrollments
FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert enrollments" ON public.enrollments
FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can update enrollments" ON public.enrollments
FOR UPDATE USING (true);

-- 6. Criar tabela payments se não existir (para o dashboard)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    payment_method VARCHAR(50),
    reference VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Habilitar RLS na tabela payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas RLS para payments
CREATE POLICY IF NOT EXISTS "Users can view payments" ON public.payments
FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert payments" ON public.payments
FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can update payments" ON public.payments
FOR UPDATE USING (true);

-- 9. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_enrollment_id ON public.payments(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON public.payments(due_date);

-- 10. Verificar se tudo foi criado corretamente
SELECT 'Tables created successfully' as result;

-- Verificar tabelas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('students', 'enrollments', 'payments', 'profiles')
ORDER BY table_name;