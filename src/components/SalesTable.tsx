// =============================================
// TABELA DE VENDAS
// Exibe vendas com ranking e opções de filtro
// =============================================

import { useState } from "react";
import { Sale, SalesRanking } from "@/types/sales";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Calendar, Trophy, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SalesTableProps {
  sales: Sale[];
  ranking: SalesRanking[];
  onDeleteSale: (id: string) => Promise<void>;
  canModify: boolean;
}

export function SalesTable({
  sales,
  ranking,
  onDeleteSale,
  canModify,
}: SalesTableProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredSales = sales.filter((sale) => {
    const saleDate = new Date(sale.saleDate);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && saleDate < start) return false;
    if (end && saleDate > end) return false;
    return true;
  });

  const totalSales = filteredSales.reduce(
    (sum, sale) => sum + sale.saleAmount,
    0
  );

  return (
    <div className="space-y-6">
      {/* Ranking Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Ranking de Vendedores
          </CardTitle>
          <CardDescription>Top vendedores do período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ranking.slice(0, 5).map((rank, index) => (
              <div
                key={rank.employeeId}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : index === 1
                        ? "bg-gray-100 text-gray-700"
                        : index === 2
                        ? "bg-orange-100 text-orange-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}º
                  </div>
                  <div>
                    <p className="font-semibold">{rank.employeeName}</p>
                    <p className="text-sm text-muted-foreground">
                      {rank.salesCount} vendas • Média: R${" "}
                      {rank.averageSale.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    R$ {rank.totalSales.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            ))}
            {ranking.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma venda registrada
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filtros e Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Histórico de Vendas
          </CardTitle>
          <CardDescription>
            Filtre por período e visualize o histórico completo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">
                Data Inicial
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">
                Data Final
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total do Período:</span>
              <span className="text-2xl font-bold text-primary">
                R$ {totalSales.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  {canModify && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canModify ? 5 : 4}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nenhuma venda encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(sale.saleDate), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {sale.employeeName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sale.description || "-"}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        R$ {sale.saleAmount.toFixed(2)}
                      </TableCell>
                      {canModify && (
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Confirmar exclusão
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir esta venda de R
                                  $ {sale.saleAmount.toFixed(2)}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDeleteSale(sale.id)}
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
