# 📋 Guia de Migração para Seu Próprio Supabase

Este guia contém o passo a passo completo para migrar este projeto para sua própria conta do Supabase.

## 🎯 Pré-requisitos

- Conta no Supabase (https://supabase.com)
- Acesso ao código do projeto

## 📝 Passo 1: Criar Novo Projeto no Supabase

1. Acesse https://supabase.com e faça login
2. Clique em "New Project"
3. Escolha um nome para seu projeto
4. Defina uma senha forte para o banco de dados
5. Escolha a região mais próxima de você
6. Aguarde a criação do projeto (pode levar alguns minutos)

## 🔑 Passo 2: Obter Credenciais

Após o projeto ser criado:

1. Vá em `Settings` → `API` no painel do Supabase
2. Copie as seguintes informações:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **Project ID** (ex: `xxxxx`)
   - **anon/public key** (chave pública)

## 🗄️ Passo 3: Criar Tabelas no Banco de Dados

Execute os seguintes scripts SQL no editor SQL do Supabase (`SQL Editor` → `New Query`):

### 3.1 Criar Enum de Roles

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
```

### 3.2 Criar Tabela de Funcionários

```sql
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view all employees"
ON public.employees FOR SELECT USING (true);

CREATE POLICY "Admins can create employees"
ON public.employees FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update employees"
ON public.employees FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete employees"
ON public.employees FOR DELETE
USING (has_role(auth.uid(), 'admin'));
```

### 3.3 Criar Tabela de Registros Semanais

```sql
CREATE TABLE public.week_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL,
  employee_name text NOT NULL,
  user_id uuid NOT NULL,
  days jsonb NOT NULL,
  total_days integer NOT NULL DEFAULT 0,
  total_advances numeric NOT NULL DEFAULT 0,
  net_total numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE
);

ALTER TABLE public.week_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view all week records"
ON public.week_records FOR SELECT USING (true);

CREATE POLICY "Admins can create week records"
ON public.week_records FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update week records"
ON public.week_records FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete week records"
ON public.week_records FOR DELETE
USING (has_role(auth.uid(), 'admin'));
```

### 3.4 Criar Tabela de Histórico

```sql
CREATE TABLE public.history_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL,
  employee_name text NOT NULL,
  user_id uuid NOT NULL,
  days jsonb NOT NULL,
  total_days integer NOT NULL,
  total_advances numeric NOT NULL,
  net_total numeric NOT NULL,
  week_number integer NOT NULL,
  closed_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.history_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view all history records"
ON public.history_records FOR SELECT USING (true);

CREATE POLICY "Admins can create history records"
ON public.history_records FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete history records"
ON public.history_records FOR DELETE
USING (has_role(auth.uid(), 'admin'));
```

### 3.5 Criar Tabela de Vendas

```sql
CREATE TABLE public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL,
  employee_name text NOT NULL,
  sale_amount numeric NOT NULL DEFAULT 0,
  sale_date timestamp with time zone NOT NULL DEFAULT now(),
  description text,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view all sales"
ON public.sales FOR SELECT USING (true);

CREATE POLICY "Admins can insert sales"
ON public.sales FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update sales"
ON public.sales FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete sales"
ON public.sales FOR DELETE
USING (has_role(auth.uid(), 'admin'));
```

### 3.6 Criar Tabela de Roles de Usuário

```sql
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

### 3.7 Criar Função de Verificação de Role

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
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
```

### 3.8 Criar Tabela de Auditoria

```sql
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_email text NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  entity_name text,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view all audit logs"
ON public.audit_logs FOR SELECT USING (true);

CREATE POLICY "Anyone authenticated can create audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

## ⚙️ Passo 4: Configurar Autenticação

1. Vá em `Authentication` → `Providers` no painel do Supabase
2. Habilite o provider "Email"
3. Em `Authentication` → `URL Configuration`:
   - **Site URL**: Coloque a URL do seu site (ex: `https://seudominio.com`)
   - **Redirect URLs**: Adicione as URLs permitidas para redirecionamento

## 🔧 Passo 5: Atualizar Configurações no Projeto

### Opção A: Usando o Componente de Configuração (Recomendado)

1. No projeto, acesse `Configurações` no menu
2. Clique em "Configurar Supabase"
3. Cole:
   - **Project ID**
   - **Project URL**
   - **Anon Key**
4. Clique em "Salvar Configurações"

### Opção B: Editando Manualmente

Edite o arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_PROJECT_ID="seu-project-id"
VITE_SUPABASE_URL="https://seu-project-id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sua-anon-key"
```

E o arquivo `supabase/config.toml`:

```toml
project_id = "seu-project-id"
```

## ✅ Passo 6: Testar a Conexão

1. Reinicie o servidor de desenvolvimento
2. Crie uma conta no sistema
3. Use o código `2406` para ativar o modo administrador
4. Teste as funcionalidades:
   - Adicionar funcionários
   - Registrar presença
   - Registrar vendas
   - Gerar relatórios

## 🔐 Passo 7: Segurança Adicional (Opcional mas Recomendado)

### Habilitar 2FA
1. Vá em `Settings` → `Authentication`
2. Ative "Enable Multi-Factor Authentication"

### Configurar Rate Limiting
1. Vá em `Settings` → `API`
2. Configure limites de requisições conforme necessário

### Backup Automático
1. Vá em `Settings` → `Database`
2. Configure backups automáticos

## 🚨 Solução de Problemas Comuns

### Erro: "Invalid project credentials"
- Verifique se copiou corretamente o Project ID, URL e Anon Key
- Certifique-se de que não há espaços extras nas credenciais

### Erro: "Row Level Security policy violation"
- Verifique se todas as políticas RLS foram criadas corretamente
- Certifique-se de que o usuário está autenticado
- Verifique se o modo administrador está ativo (código 2406)

### Erro: "Authentication failed"
- Verifique as configurações de URL em Authentication → URL Configuration
- Certifique-se de que o email confirmation está desabilitado para testes
- Em `Authentication` → `Providers` → `Email`, desative "Confirm email"

### Dados não aparecem
- Verifique se está autenticado
- Verifique se as tabelas foram criadas corretamente
- Verifique os logs de erro no console do navegador

## 📞 Suporte

Para mais informações:
- Documentação do Supabase: https://supabase.com/docs
- Comunidade Discord: https://discord.supabase.com
- GitHub Issues: [link do seu repositório]

## 🎉 Pronto!

Seu projeto agora está conectado ao seu próprio Supabase! Você tem controle total sobre os dados e pode personalizar conforme necessário.
