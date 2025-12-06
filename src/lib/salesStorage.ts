// =============================================
// GERENCIAMENTO DE VENDAS NO SUPABASE
// Funções para CRUD de vendas e estatísticas
// =============================================

import { supabase } from "@/integrations/supabase/client";
import { Sale, SalesRanking } from "@/types/sales";

export const salesStorage = {
  // Buscar todas as vendas
  getSales: async (): Promise<Sale[]> => {
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .order("sale_date", { ascending: false });

    if (error) throw error;

    return (data || []).map((sale) => ({
      id: sale.id,
      employeeId: sale.employee_id,
      employeeName: sale.employee_name,
      saleAmount: Number(sale.sale_amount),
      saleDate: sale.sale_date,
      description: sale.description || undefined,
      userId: sale.user_id,
      createdAt: sale.created_at || undefined,
    }));
  },

  // Buscar vendas de um período específico
  getSalesByPeriod: async (
    startDate: string,
    endDate: string
  ): Promise<Sale[]> => {
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .gte("sale_date", startDate)
      .lte("sale_date", endDate)
      .order("sale_date", { ascending: false });

    if (error) throw error;

    return (data || []).map((sale) => ({
      id: sale.id,
      employeeId: sale.employee_id,
      employeeName: sale.employee_name,
      saleAmount: Number(sale.sale_amount),
      saleDate: sale.sale_date,
      description: sale.description || undefined,
      userId: sale.user_id,
      createdAt: sale.created_at || undefined,
    }));
  },

  // Criar nova venda
  createSale: async (sale: Omit<Sale, "id" | "createdAt">): Promise<Sale> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("sales")
      .insert({
        employee_id: sale.employeeId,
        employee_name: sale.employeeName,
        sale_amount: sale.saleAmount,
        sale_date: sale.saleDate,
        description: sale.description,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      employeeId: data.employee_id,
      employeeName: data.employee_name,
      saleAmount: Number(data.sale_amount),
      saleDate: data.sale_date,
      description: data.description || undefined,
      userId: data.user_id,
      createdAt: data.created_at || undefined,
    };
  },

  // Atualizar venda
  updateSale: async (id: string, updates: Partial<Sale>): Promise<void> => {
    const updateData: any = {};

    if (updates.saleAmount !== undefined)
      updateData.sale_amount = updates.saleAmount;
    if (updates.saleDate !== undefined) updateData.sale_date = updates.saleDate;
    if (updates.description !== undefined)
      updateData.description = updates.description;

    const { error } = await supabase
      .from("sales")
      .update(updateData)
      .eq("id", id);

    if (error) throw error;
  },

  // Deletar venda
  deleteSale: async (id: string): Promise<void> => {
    const { error } = await supabase.from("sales").delete().eq("id", id);

    if (error) throw error;
  },

  // Calcular ranking de vendas
  getSalesRanking: async (
    startDate?: string,
    endDate?: string
  ): Promise<SalesRanking[]> => {
    let query = supabase
      .from("sales")
      .select("employee_id, employee_name, sale_amount");

    if (startDate) query = query.gte("sale_date", startDate);
    if (endDate) query = query.lte("sale_date", endDate);

    const { data, error } = await query;

    if (error) throw error;

    // Agrupar vendas por funcionário
    const salesByEmployee = (data || []).reduce((acc, sale) => {
      const key = sale.employee_id;
      if (!acc[key]) {
        acc[key] = {
          employeeId: sale.employee_id,
          employeeName: sale.employee_name,
          totalSales: 0,
          salesCount: 0,
        };
      }
      acc[key].totalSales += Number(sale.sale_amount);
      acc[key].salesCount += 1;
      return acc;
    }, {} as Record<string, Omit<SalesRanking, "averageSale">>);

    // Calcular média e ordenar
    return Object.values(salesByEmployee)
      .map((item) => ({
        ...item,
        averageSale: item.totalSales / item.salesCount,
      }))
      .sort((a, b) => b.totalSales - a.totalSales);
  },
};
