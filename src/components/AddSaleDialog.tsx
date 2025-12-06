// =============================================
// DIÁLOGO PARA ADICIONAR VENDA
// Permite registrar vendas por funcionário
// =============================================

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Employee } from "@/types";
import { DollarSign } from "lucide-react";

interface AddSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSale: (
    employeeId: string,
    employeeName: string,
    amount: number,
    date: string,
    description?: string
  ) => Promise<void>;
  employees: Employee[];
}

export function AddSaleDialog({
  open,
  onOpenChange,
  onAddSale,
  employees,
}: AddSaleDialogProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployeeId || !amount) {
      return;
    }

    const employee = employees.find((e) => e.id === selectedEmployeeId);
    if (!employee) return;

    setLoading(true);
    try {
      await onAddSale(
        selectedEmployeeId,
        employee.name,
        parseFloat(amount),
        date,
        description || undefined
      );
      
      // Limpar formulário
      setSelectedEmployeeId("");
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setDescription("");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Registrar Venda
          </DialogTitle>
          <DialogDescription>
            Adicione uma nova venda para um funcionário
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Funcionário *</Label>
            <Select
              value={selectedEmployeeId}
              onValueChange={setSelectedEmployeeId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um funcionário" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor da Venda (R$) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data da Venda *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              placeholder="Detalhes sobre a venda..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Venda"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
