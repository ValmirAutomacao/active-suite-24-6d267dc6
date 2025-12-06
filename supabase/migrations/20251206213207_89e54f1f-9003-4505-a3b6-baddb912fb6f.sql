-- Corrigir políticas RLS da tabela payments para permitir operações de admin

-- Primeiro, remover políticas existentes que possam conflitar
DROP POLICY IF EXISTS "Guardians can see their own student payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view their students payments" ON public.payments;

-- Política para admin visualizar todos os pagamentos
CREATE POLICY "Admins can view all payments"
ON public.payments
FOR SELECT
TO authenticated
USING (true);

-- Política para admin inserir pagamentos
CREATE POLICY "Admins can insert payments"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para admin atualizar pagamentos
CREATE POLICY "Admins can update payments"
ON public.payments
FOR UPDATE
TO authenticated
USING (true);

-- Política para admin deletar pagamentos
CREATE POLICY "Admins can delete payments"
ON public.payments
FOR DELETE
TO authenticated
USING (true);

-- Política para guardians visualizarem pagamentos dos seus alunos
CREATE POLICY "Guardians can view their student payments"
ON public.payments
FOR SELECT
TO authenticated
USING (
  student_id IN (
    SELECT id FROM students
    WHERE (guardian ->> 'email') = auth.email()
  )
);