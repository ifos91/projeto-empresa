// =============================================
// DIÁLOGO DE CONFIGURAÇÕES
// Permite alterar valor da diária
// =============================================

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon } from "lucide-react";

interface SettingsDialogProps {
  dailyRate: number;
  onSave: (rate: number) => void;
}

export const SettingsDialog = ({ dailyRate, onSave }: SettingsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [rate, setRate] = useState(dailyRate.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRate = parseFloat(rate);
    if (!isNaN(newRate) && newRate > 0) {
      onSave(newRate);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <SettingsIcon className="mr-2 h-4 w-4" />
          Configurações
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="rate">Valor da Diária (R$)</Label>
            <Input
              id="rate"
              type="number"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="100.00"
              className="mt-2"
            />
          </div>
          <Button type="submit" className="w-full">
            Salvar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
