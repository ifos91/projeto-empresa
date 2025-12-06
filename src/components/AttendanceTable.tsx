// =============================================
// TABELA DE PRESENÇA SEMANAL
// Exibe grid com dias da semana e permite marcar presença
// e registrar vales de cada funcionário
// =============================================

import { WeekRecord } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AttendanceTableProps {
  records: WeekRecord[];
  dailyRate: number;
  onUpdatePresence: (employeeId: string, day: string, present: boolean) => void;
  onUpdateAdvance: (employeeId: string, day: string, amount: number) => void;
  onRemoveEmployee: (employeeId: string) => void;
}

const DAYS = [
  { key: "monday", label: "Seg" },
  { key: "tuesday", label: "Ter" },
  { key: "wednesday", label: "Qua" },
  { key: "thursday", label: "Qui" },
  { key: "friday", label: "Sex" },
  { key: "saturday", label: "Sáb" },
  { key: "sunday", label: "Dom" },
];

export const AttendanceTable = ({
  records,
  dailyRate,
  onUpdatePresence,
  onUpdateAdvance,
  onRemoveEmployee,
}: AttendanceTableProps) => {
  return (
    <Card className="overflow-x-auto shadow-card">
      <div className="min-w-[1000px]">
        <div className="bg-gradient-header p-4">
          <div className="grid grid-cols-12 gap-2 text-sm font-semibold text-primary-foreground">
            <div className="col-span-2">Funcionário</div>
            {DAYS.map((day) => (
              <div key={day.key} className="text-center">{day.label}</div>
            ))}
            <div className="text-center">Total Dias</div>
            <div className="text-center">Total Vales</div>
            <div className="text-center">Total Líquido</div>
            <div className="text-center">Ações</div>
          </div>
        </div>

        <div className="divide-y">
          {records.map((record) => (
            <div key={record.employeeId} className="grid grid-cols-12 gap-2 p-4 items-center">
              <div className="col-span-2 font-medium">{record.employeeName}</div>
              
              {DAYS.map((day) => {
                const dayRecord = record.days[day.key as keyof typeof record.days];
                return (
                  <div key={day.key} className="space-y-2">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={dayRecord.present}
                        onCheckedChange={(checked) =>
                          onUpdatePresence(record.employeeId, day.key, checked as boolean)
                        }
                      />
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={dayRecord.advance || ""}
                      onChange={(e) =>
                        onUpdateAdvance(record.employeeId, day.key, parseFloat(e.target.value) || 0)
                      }
                      className="h-8 text-xs text-center"
                    />
                  </div>
                );
              })}

              <div className="text-center font-semibold">{record.totalDays}</div>
              <div className="text-center text-destructive font-semibold">
                R$ {record.totalAdvances.toFixed(2)}
              </div>
              <div className="text-center text-success font-semibold text-lg">
                R$ {record.netTotal.toFixed(2)}
              </div>
              <div className="text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveEmployee(record.employeeId)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {records.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            Nenhum funcionário adicionado. Clique em "Adicionar Funcionário" para começar.
          </div>
        )}
      </div>
    </Card>
  );
};
