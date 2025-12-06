// =============================================
// TIPOS PARA SISTEMA DE VENDAS
// Define interfaces para vendas e rankings
// =============================================

export interface Sale {
  id: string;
  employeeId: string;
  employeeName: string;
  saleAmount: number;
  saleDate: string;
  description?: string;
  userId: string;
  createdAt?: string;
}

export interface SalesRanking {
  employeeId: string;
  employeeName: string;
  totalSales: number;
  salesCount: number;
  averageSale: number;
}
