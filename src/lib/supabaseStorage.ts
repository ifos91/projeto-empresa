// =============================================
// INTEGRAÇÃO COM SUPABASE
// Gerencia todas as operações de banco de dados
// Inclui sistema de auditoria para rastrear mudanças
// =============================================

import { supabase } from "@/integrations/supabase/client";
import { Employee, WeekRecord, HistoryRecord } from "@/types";

// =============================================
// FUNÇÃO DE AUDITORIA
// Registra todas as ações no banco de dados
// =============================================
const logAudit = async (
  action: string,
  entityType: string,
  entityId: string | null,
  entityName: string | null,
  details: any = null
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      user_email: user.email || "desconhecido",
      action,
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
      details: details ? JSON.parse(JSON.stringify(details)) : null,
    });
  } catch (error) {
    console.error("Erro ao registrar auditoria:", error);
  }
};

export const supabaseStorage = {
  // Employees
  getEmployees: async (): Promise<Employee[]> => {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("created_at", { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Salvar novo funcionário
  // AUDITORIA: Registra criação de funcionário
  // NOTA: user_id ainda é salvo para auditoria, mas não afeta visualização
  saveEmployee: async (name: string): Promise<Employee> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("employees")
      .insert({ name, user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    
    // Registrar auditoria
    await logAudit("create", "employee", data.id, name, { name });
    
    return data;
  },

  // Deletar funcionário
  // AUDITORIA: Registra exclusão de funcionário
  deleteEmployee: async (id: string): Promise<void> => {
    // Buscar nome do funcionário antes de deletar
    const { data: employee } = await supabase
      .from("employees")
      .select("name")
      .eq("id", id)
      .single();
    
    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
    
    // Registrar auditoria
    await logAudit("delete", "employee", id, employee?.name || "desconhecido");
  },

  // Week Records
  getCurrentWeek: async (): Promise<WeekRecord[]> => {
    const { data, error } = await supabase
      .from("week_records")
      .select("*")
      .order("created_at", { ascending: true });
    
    if (error) throw error;
    
    return (data || []).map(record => ({
      employeeId: record.employee_id,
      employeeName: record.employee_name,
      days: record.days as any,
      totalDays: record.total_days,
      totalAdvances: Number(record.total_advances),
      totalExtras: Number(record.total_extras || 0),
      netTotal: Number(record.net_total),
    }));
  },

  // Salvar/atualizar registro semanal
  // AUDITORIA: Registra alterações em presença e vales
  saveWeekRecord: async (record: WeekRecord): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("week_records")
      .upsert({
        employee_id: record.employeeId,
        user_id: user.id,
        employee_name: record.employeeName,
        days: record.days as any,
        total_days: record.totalDays,
        total_advances: record.totalAdvances,
        total_extras: record.totalExtras || 0,
        net_total: record.netTotal,
      }, {
        onConflict: "employee_id"
      });
    
    if (error) throw error;
    
    // Registrar auditoria
    await logAudit("update", "week_record", record.employeeId, record.employeeName, {
      totalDays: record.totalDays,
      totalAdvances: record.totalAdvances,
      totalExtras: record.totalExtras,
      netTotal: record.netTotal,
    });
  },

  deleteWeekRecord: async (employeeId: string): Promise<void> => {
    const { error } = await supabase
      .from("week_records")
      .delete()
      .eq("employee_id", employeeId);
    
    if (error) throw error;
  },

  // Limpar semana atual (usado ao fechar semana)
  // AUDITORIA: Registra fechamento de semana
  clearCurrentWeek: async (): Promise<void> => {
    const { error } = await supabase
      .from("week_records")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    
    if (error) throw error;
    
    // Registrar auditoria
    await logAudit("close_week", "week_records", null, null, {
      action: "Semana fechada e movida para histórico"
    });
  },

  // History
  getHistory: async (): Promise<HistoryRecord[]> => {
    const { data, error } = await supabase
      .from("history_records")
      .select("*")
      .order("closed_at", { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(record => ({
      employeeId: record.employee_id,
      employeeName: record.employee_name,
      days: record.days as any,
      totalDays: record.total_days,
      totalAdvances: Number(record.total_advances),
      totalExtras: Number(record.total_extras || 0),
      netTotal: Number(record.net_total),
      weekNumber: record.week_number,
      closedAt: record.closed_at,
    }));
  },

  saveHistoryRecords: async (records: HistoryRecord[]): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const historyData = records.map(record => ({
      user_id: user.id,
      employee_id: record.employeeId,
      employee_name: record.employeeName,
      days: record.days as any,
      total_days: record.totalDays,
      total_advances: record.totalAdvances,
      total_extras: record.totalExtras || 0,
      net_total: record.netTotal,
      week_number: record.weekNumber,
      closed_at: record.closedAt,
    }));

    const { error } = await supabase
      .from("history_records")
      .insert(historyData);
    
    if (error) throw error;
  },

  // Limpar todo o histórico
  // AUDITORIA: Registra limpeza completa do histórico
  clearHistory: async (): Promise<void> => {
    const { error } = await supabase
      .from("history_records")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    
    if (error) throw error;
    
    // Registrar auditoria
    await logAudit("clear_history", "history_records", null, null, {
      action: "Todo o histórico foi zerado"
    });
  },

  // Buscar logs de auditoria
  // Retorna histórico de todas as modificações
  getAuditLogs: async (): Promise<any[]> => {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500); // Últimas 500 ações
    
    if (error) throw error;
    return data || [];
  },
};
