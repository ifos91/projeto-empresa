# Guia de Migração para Supabase

Este arquivo contém todos os scripts SQL necessários para configurar um novo projeto Supabase.

## Passo 1: Criar Conta no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub, Google ou e-mail
4. Clique em "New Project"
5. Preencha:
   - **Organization**: Selecione ou crie uma
   - **Project Name**: Nome do projeto (ex: sucata-benevides)
   - **Database Password**: Crie uma senha forte (guarde-a!)
   - **Region**: Escolha a mais próxima (ex: South America - São Paulo)
6. Clique em "Create new project" e aguarde a criação

## Passo 2: Obter Credenciais

Após criar o projeto:

1. Vá em **Settings** → **API**
2. Anote:
   - **Project URL**: `https://SEU_ID.supabase.co`
   - **Anon/Public Key**: Chave pública

## Passo 3: Executar Script Completo

Vá em **SQL Editor** e execute o script abaixo de uma vez:

```sql
-- ============================================
-- SCRIPT COMPLETO DE MIGRAÇÃO
-- Execute tudo de uma vez
-- ============================================

-- 1. Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Criar função de verificação de role (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 3. Tabela de roles de usuário
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles" 
  ON public.user_roles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own role"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4. Tabela de funcionários
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view all employees" 
  ON public.employees FOR SELECT 
  USING (true);

CREATE POLICY "Admins can create employees" 
  ON public.employees FOR INSERT 
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update employees" 
  ON public.employees FOR UPDATE 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete employees" 
  ON public.employees FOR DELETE 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Tabela de registros semanais
CREATE TABLE public.week_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  days JSONB NOT NULL,
  total_days INTEGER NOT NULL DEFAULT 0,
  total_advances NUMERIC NOT NULL DEFAULT 0,
  net_total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(employee_id)
);

ALTER TABLE public.week_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view all week records" 
  ON public.week_records FOR SELECT 
  USING (true);

CREATE POLICY "Admins can create week records" 
  ON public.week_records FOR INSERT 
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update week records" 
  ON public.week_records FOR UPDATE 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete week records" 
  ON public.week_records FOR DELETE 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. Tabela de histórico
CREATE TABLE public.history_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  employee_name TEXT NOT NULL,
  days JSONB NOT NULL,
  total_days INTEGER NOT NULL,
  total_advances NUMERIC NOT NULL,
  net_total NUMERIC NOT NULL,
  week_number INTEGER NOT NULL,
  closed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.history_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view all history records" 
  ON public.history_records FOR SELECT 
  USING (true);

CREATE POLICY "Admins can create history records" 
  ON public.history_records FOR INSERT 
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete history records" 
  ON public.history_records FOR DELETE 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 7. Tabela de vendas
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  sale_amount NUMERIC NOT NULL DEFAULT 0,
  sale_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view all sales" 
  ON public.sales FOR SELECT 
  USING (true);

CREATE POLICY "Admins can insert sales" 
  ON public.sales FOR INSERT 
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update sales" 
  ON public.sales FOR UPDATE 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete sales" 
  ON public.sales FOR DELETE 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 8. Tabela de logs de auditoria
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  entity_name TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view all audit logs" 
  ON public.audit_logs FOR SELECT 
  USING (true);

CREATE POLICY "Anyone authenticated can create audit logs" 
  ON public.audit_logs FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

## Passo 4: Configurar Autenticação

1. Vá em **Authentication** → **Settings**
2. Em **Email Auth**:
   - **Confirm email**: Desabilite para testes
3. Em **URL Configuration**:
   - **Site URL**: URL do seu app

## Passo 5: Testar

1. Crie uma conta no sistema
2. Clique no ícone de escudo (🛡️)
3. Digite `2406` e clique "Ativar"
4. O escudo deve ficar verde
5. Agora adicione um funcionário

## Código Admin

**Código de administrador: `2406`**

Use para:
- Ativar modo admin no sistema
- Habilitar adição/edição/exclusão de dados

## Resumo das Tabelas

| Tabela | Descrição |
|--------|-----------|
| `user_roles` | Roles de usuários (admin/user) |
| `employees` | Lista de funcionários |
| `week_records` | Registros de presença semanais |
| `history_records` | Histórico de semanas fechadas |
| `sales` | Registro de vendas |
| `audit_logs` | Logs de auditoria |
