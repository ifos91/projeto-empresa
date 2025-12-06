// =============================================
// TABELA DE HISTÓRICO
// Exibe semanas fechadas com totais por funcionário
// =============================================

import { HistoryRecord } from "@/types";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface HistoryTableProps {
  history: HistoryRecord[];
}

export const HistoryTable = ({ history }: HistoryTableProps) => {
  return (
    <Card className="shadow-card">
      <div className="bg-gradient-header p-4">
        <h2 className="text-lg font-semibold text-primary-foreground">Histórico de Semanas</h2>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Semana</TableHead>
            <TableHead>Funcionário</TableHead>
            <TableHead className="text-center">Dias Trabalhados</TableHead>
            <TableHead className="text-right">Total Vales</TableHead>
            <TableHead className="text-right">Total Líquido</TableHead>
            <TableHead>Fechado em</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((record, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">Semana {record.weekNumber}</TableCell>
              <TableCell>{record.employeeName}</TableCell>
              <TableCell className="text-center">{record.totalDays}</TableCell>
              <TableCell className="text-right text-destructive">
                R$ {record.totalAdvances.toFixed(2)}
              </TableCell>
              <TableCell className="text-right text-success font-semibold">
                R$ {record.netTotal.toFixed(2)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(record.closedAt).toLocaleString("pt-BR")}
              </TableCell>
            </TableRow>
          ))}
          {history.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                Nenhum histórico disponível. Feche uma semana para começar.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
};
