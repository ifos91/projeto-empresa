// =============================================
// DIÁLOGO PARA ADICIONAR FUNCIONÁRIO
// Formulário simples para cadastrar novo funcionário
// =============================================

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";

interface AddEmployeeDialogProps {
  onAdd: (name: string) => void;
}

export const AddEmployeeDialog = ({ onAdd }: AddEmployeeDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  // Função para processar o formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validar que o nome não está vazio
    if (name.trim()) {
      onAdd(name.trim());
      setName("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-button">
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar Funcionário
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Funcionário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Funcionário</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome"
              className="mt-2"
            />
          </div>
          <Button type="submit" className="w-full">
            Adicionar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
