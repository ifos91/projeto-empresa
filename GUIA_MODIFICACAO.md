# 📖 Guia de Modificação - Sucata Benevides

## 🎯 Visão Geral do Sistema

Este sistema de **Controle de Presença e Pagamentos** foi desenvolvido para gerenciar funcionários, registrar presenças diárias, controlar vales e calcular pagamentos líquidos.

---

## 🗂️ Estrutura de Arquivos

### **Páginas Principais** (`src/pages/`)
- **`Index.tsx`** - Página principal com controle de presença e histórico
- **`Auth.tsx`** - Página de login/cadastro com código de confirmação
- **`AuditLogs.tsx`** - Página de logs de auditoria (histórico de modificações)
- **`NotFound.tsx`** - Página 404

### **Componentes** (`src/components/`)
- **`AddEmployeeDialog.tsx`** - Diálogo para adicionar funcionário
- **`AttendanceTable.tsx`** - Tabela de controle semanal
- **`HistoryTable.tsx`** - Tabela de histórico de semanas fechadas
- **`SettingsDialog.tsx`** - Diálogo de configurações (valor da diária)

### **Lógica de Negócio** (`src/lib/`)
- **`supabaseStorage.ts`** - Funções para interagir com banco de dados + auditoria
- **`storage.ts`** - Armazenamento local (configurações)
- **`pdfGenerator.ts`** - Geração de PDFs

### **Hooks** (`src/hooks/`)
- **`useAuth.tsx`** - Hook de autenticação

---

## 🔧 Como Modificar Funcionalidades

### 1️⃣ **Alterar o Código de Confirmação**
📁 Arquivo: `src/pages/Auth.tsx` (linha ~37)

```typescript
// Trocar "2406" pelo novo código
if (confirmationCode !== "2406") {
  toast.error("Código de confirmação inválido!");
  return;
}
```

---

### 2️⃣ **Alterar Valor Padrão da Diária**
📁 Arquivo: `src/pages/Index.tsx` (linha ~24)

```typescript
// Trocar 70 pelo novo valor padrão
const [dailyRate, setDailyRate] = useState(70);
```

---

### 3️⃣ **Modificar Dias da Semana**
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

### 4️⃣ **Alterar Nome do Sistema**
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

### 5️⃣ **Adicionar Novos Campos de Auditoria**
📁 Arquivo: `src/lib/supabaseStorage.ts`

A função `logAudit` registra todas as ações. Para adicionar mais informações:

```typescript
await logAudit("update", "week_record", record.employeeId, record.employeeName, {
  totalDays: record.totalDays,
  totalAdvances: record.totalAdvances,
  netTotal: record.netTotal,
  // Adicionar novos campos aqui
  novoCampo: "valor",
});
```

---

### 6️⃣ **Modificar Cores e Design**
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

### **Cadastro com Código**
- Apenas usuários com código "2406" podem criar contas
- Modificar código em: `src/pages/Auth.tsx`

### **Auditoria Automática**
- Todas as ações são registradas automaticamente
- Consultar em: Botão de "arquivo" no cabeçalho → Logs de Auditoria
- Exportar logs para TXT na página de auditoria

### **Row Level Security (RLS)**
- Cada usuário só vê seus próprios dados
- Configurado automaticamente no banco Supabase

---

## 📊 Banco de Dados (Supabase)

### **Tabelas**
1. **`employees`** - Cadastro de funcionários
2. **`week_records`** - Registros da semana atual
3. **`history_records`** - Histórico de semanas fechadas
4. **`audit_logs`** - Logs de auditoria

### **Consultar Dados**
Acesse o backend em: Lovable Cloud → Database

---

## 🚀 Funcionalidades Principais

### **Página Principal**
- ✅ Adicionar funcionário
- ✅ Marcar presença (checkbox por dia)
- ✅ Registrar vales (valor por dia)
- ✅ Cálculo automático de totais
- ✅ Fechar semana (move para histórico)
- ✅ Exportar/Importar dados da semana atual
- ✅ Gerar PDF
- ✅ Imprimir relatório
- ✅ Zerar histórico

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
   - Nunca compartilhe o código de confirmação publicamente
   - Cada usuário tem acesso apenas aos próprios dados
   - Logs de auditoria não podem ser editados

---

## 🆘 Resolução de Problemas

### **Funcionário não está sendo adicionado**
- Verificar se está logado
- Verificar conexão com internet
- Conferir console do navegador (F12) para erros

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
- Documentação do Supabase: https://supabase.com/docs
- Lovable Cloud: Interface visual do backend

---

**Desenvolvido para Sucata Benevides**  
Sistema de Controle de Presença e Pagamentos
