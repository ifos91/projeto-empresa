# 📖 Guia de Modificação - Sucata Benevides

## 🎯 Visão Geral do Sistema

Este sistema de **Controle de Presença e Pagamentos** foi desenvolvido para gerenciar funcionários, registrar presenças diárias, controlar vales, extras e calcular pagamentos líquidos.

---

## 🗂️ Estrutura de Arquivos

### **Páginas Principais** (`src/pages/`)
- **`Index.tsx`** - Página principal com controle de presença e histórico
- **`Auth.tsx`** - Página de login/cadastro
- **`AuditLogs.tsx`** - Página de logs de auditoria (histórico de modificações)
- **`NotFound.tsx`** - Página 404

### **Componentes** (`src/components/`)
- **`AddEmployeeDialog.tsx`** - Diálogo para adicionar funcionário
- **`AttendanceTable.tsx`** - Tabela de controle semanal (com vales e extras)
- **`HistoryTable.tsx`** - Tabela de histórico de semanas fechadas
- **`SettingsDialog.tsx`** - Diálogo de configurações (valor da diária)
- **`AdminModeDialog.tsx`** - Diálogo de verificação de permissão admin

### **Lógica de Negócio** (`src/lib/`)
- **`supabaseStorage.ts`** - Funções para interagir com banco de dados + auditoria
- **`storage.ts`** - Armazenamento local (configurações)
- **`pdfGenerator.ts`** - Geração de PDFs

### **Hooks** (`src/hooks/`)
- **`useAuth.tsx`** - Hook de autenticação
- **`useAdminMode.tsx`** - Hook de verificação de admin (seguro, verifica no banco)

---

## 🔧 Como Modificar Funcionalidades

### 1️⃣ **Alterar Valor Padrão da Diária**
📁 Arquivo: `src/pages/Index.tsx` (linha ~24)

```typescript
// Trocar 70 pelo novo valor padrão
const [dailyRate, setDailyRate] = useState(70);
```

---

### 2️⃣ **Modificar Dias da Semana**
📁 Arquivo: `src/components/AttendanceTable.tsx` (linha ~16-24)

```typescript
const DAYS = [
  { key: "monday", label: "Seg" },
  { key: "tuesday", label: "Ter" },
  // ... adicionar ou remover dias aqui
];
```

⚠️ **Importante**: Se adicionar/remover dias, também precisa atualizar:
- `src/types/index.ts` (tipo `DailyRecordDays`)
- `src/pages/Index.tsx` (função `createEmptyWeekRecord`)

---

### 3️⃣ **Alterar Nome do Sistema**
📁 Arquivos a modificar:
1. `src/pages/Index.tsx` (linha ~303) - Título principal
2. `src/pages/Auth.tsx` (linha ~74) - Título da página de login
3. `index.html` (tag `<title>`) - Título da aba do navegador

```typescript
// Exemplo em Index.tsx
<h1 className="text-4xl font-bold">
  Seu Novo Nome Aqui
</h1>
```

---

### 4️⃣ **Adicionar Novos Campos de Auditoria**
📁 Arquivo: `src/lib/supabaseStorage.ts`

A função `logAudit` registra todas as ações. Para adicionar mais informações:

```typescript
await logAudit("update", "week_record", record.employeeId, record.employeeName, {
  totalDays: record.totalDays,
  totalAdvances: record.totalAdvances,
  totalExtras: record.totalExtras,
  netTotal: record.netTotal,
  // Adicionar novos campos aqui
  novoCampo: "valor",
});
```

---

### 5️⃣ **Modificar Cores e Design**
📁 Arquivo: `src/index.css`

Todas as cores usam variáveis HSL:

```css
:root {
  --primary: 217 91% 60%;        /* Cor principal (azul) */
  --destructive: 0 84% 60%;      /* Cor de erro (vermelho) */
  --success: 142 71% 45%;        /* Cor de sucesso (verde) */
  /* ... modificar valores aqui */
}
```

---

## 🔒 Sistema de Segurança

### **Modo Administrador**
O modo admin é verificado diretamente no banco de dados, garantindo segurança.

**Para se tornar admin (primeira vez):**
Execute este SQL no Supabase SQL Editor:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'SEU_EMAIL@EXEMPLO.COM';
```

### **Cadastro de Usuários**
- Qualquer pessoa pode criar uma conta
- Novas contas são usuários comuns (sem permissão de modificar dados)
- Apenas admins podem atribuir role de admin a outros usuários

### **Auditoria Automática**
- Todas as ações são registradas automaticamente
- Consultar em: Botão de "arquivo" no cabeçalho → Logs de Auditoria
- Exportar logs para TXT na página de auditoria

### **Row Level Security (RLS)**
- Admins podem ver todos os dados
- Usuários comuns podem apenas visualizar dados
- Logs de auditoria são protegidos

---

## 📊 Banco de Dados

### **Tabelas**
1. **`user_roles`** - Roles de usuários (admin/user)
2. **`employees`** - Cadastro de funcionários
3. **`week_records`** - Registros da semana atual (com extras)
4. **`history_records`** - Histórico de semanas fechadas
5. **`sales`** - Registro de vendas
6. **`audit_logs`** - Logs de auditoria

### **Estrutura do campo `days` (JSONB)**
```json
{
  "seg": { "present": true, "advance": 0, "extra": 0 },
  "ter": { "present": false, "advance": 50, "extra": 0 },
  "qua": { "present": true, "advance": 0, "extra": 100 },
  "qui": { "present": true, "advance": 0, "extra": 0 },
  "sex": { "present": true, "advance": 0, "extra": 0 }
}
```

---

## 🚀 Funcionalidades Principais

### **Página Principal**
- ✅ Adicionar funcionário
- ✅ Marcar presença (checkbox por dia)
- ✅ Registrar vales (valor por dia) - **subtrai do total**
- ✅ Registrar extras (valor por dia) - **soma ao total**
- ✅ Cálculo automático de totais: `(Dias × Diária) - Vales + Extras`
- ✅ Fechar semana (move para histórico)
- ✅ Exportar/Importar dados da semana atual
- ✅ Gerar PDF (inclui vales e extras)
- ✅ Imprimir relatório
- ✅ Zerar histórico

### **Vendas**
- ✅ Registrar vendas por funcionário
- ✅ Ranking de vendas
- ✅ Histórico de vendas

### **Logs de Auditoria**
- ✅ Ver histórico completo de modificações
- ✅ Filtrar por data, usuário, tipo de ação
- ✅ Exportar logs para arquivo TXT

---

## 🛠️ Comandos Úteis

### **Desenvolvimento Local**
```bash
npm run dev          # Iniciar servidor de desenvolvimento
npm run build        # Compilar para produção
```

### **Adicionar Pacotes**
```bash
npm install nome-do-pacote
```

---

## 📝 Notas Importantes

1. **Todos os comentários** no código estão em português
2. **Sistema de auditoria** rastreia automaticamente:
   - Quem fez a modificação
   - O que foi modificado
   - Data e hora exatas
   - Detalhes da operação

3. **Backup automático**: Use Exportar/Importar para backup manual

4. **Segurança**: 
   - Permissões de admin são gerenciadas no banco de dados
   - Não existe código hardcoded para acesso admin
   - Logs de auditoria não podem ser editados

---

## 🆘 Resolução de Problemas

### **Funcionário não está sendo adicionado**
- Verificar se está logado
- Verificar se tem permissão de administrador (escudo verde)
- Verificar conexão com internet
- Conferir console do navegador (F12) para erros

### **Não consigo ativar modo admin**
- O modo admin é atribuído via SQL no banco de dados
- Consulte o arquivo `SUPABASE_MIGRATION.md` para o comando SQL

### **Dados não aparecem**
- Fazer logout e login novamente
- Limpar cache do navegador
- Verificar se está usando a conta correta

### **Erro ao exportar/importar**
- Verificar formato do arquivo JSON
- Conferir se tem permissão de escrita na pasta de downloads

---

## 📞 Suporte

Para dúvidas ou modificações mais complexas, consulte:
- Documentação do React: https://react.dev
- Arquivo de migração: `SUPABASE_MIGRATION.md`

---

**Desenvolvido para Sucata Benevides**  
Sistema de Controle de Presença e Pagamentos
