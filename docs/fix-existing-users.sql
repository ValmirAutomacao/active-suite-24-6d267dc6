-- SCRIPT PARA CORRIGIR USUÁRIOS EXISTENTES
-- Execute este script no Supabase Dashboard > SQL Editor

-- 1. PRIMEIRO: Verificar usuários existentes
SELECT
  p.id,
  p.full_name,
  p.registration_flow,
  p.onboarding_completed,
  au.email,
  au.created_at
FROM public.profiles p
JOIN auth.users au ON p.id = au.id
ORDER BY au.created_at DESC;

-- 2. OPÇÃO A: Corrigir usuário específico (MAIS SEGURO)
-- Substitua 'valmirmoreirajunior@gmail.com' pelo email correto do admin
/*
UPDATE public.profiles
SET registration_flow = 'admin',
    onboarding_completed = true,
    updated_at = NOW()
WHERE id IN (
    SELECT au.id
    FROM auth.users au
    WHERE au.email = 'valmirmoreirajunior@gmail.com'
);
*/

-- 3. OPÇÃO B: Corrigir TODOS os usuários 'enrollment' para 'admin' (MENOS SEGURO)
-- Descomente apenas se tiver certeza de que todos os 'enrollment' devem ser admin
/*
UPDATE public.profiles
SET registration_flow = 'admin',
    onboarding_completed = true,
    updated_at = NOW()
WHERE registration_flow = 'enrollment';
*/

-- 4. OPÇÃO C: Corrigir usuários criados ANTES de hoje (assumindo que são admins)
-- Descomente se quiser que usuários antigos sejam admin
/*
UPDATE public.profiles
SET registration_flow = 'admin',
    onboarding_completed = true,
    updated_at = NOW()
WHERE registration_flow IN ('enrollment', 'internal')
AND created_at < CURRENT_DATE;
*/

-- 5. VERIFICAR RESULTADO (sempre execute este)
SELECT
  p.id,
  p.full_name,
  p.registration_flow,
  p.onboarding_completed,
  au.email,
  'DEPOIS' as status
FROM public.profiles p
JOIN auth.users au ON p.id = au.id
ORDER BY au.created_at DESC;