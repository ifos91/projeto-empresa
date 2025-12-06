// =============================================
// DIÁLOGO DE MODO ADMINISTRADOR
// Interface para ativar/desativar modo admin
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
import { Shield, ShieldOff } from "lucide-react";
import { toast } from "sonner";

interface AdminModeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdminModeActive: boolean;
  onActivate: (code: string) => Promise<boolean>;
  onDeactivate: () => void;
}

export function AdminModeDialog({
  open,
  onOpenChange,
  isAdminModeActive,
  onActivate,
  onDeactivate,
}: AdminModeDialogProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!code.trim()) {
      toast.error("Digite o código de administrador");
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await onActivate(code);
      
      if (success) {
        toast.success("Modo administrador ativado!");
        setCode("");
        onOpenChange(false);
      } else {
        toast.error("Código inválido!");
      }
    } catch (error) {
      console.error("Error activating admin mode:", error);
      toast.error("Erro ao ativar modo administrador");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = () => {
    onDeactivate();
    toast.info("Modo administrador desativado");
    onOpenChange(false);
  };

  if (isAdminModeActive) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Modo Administrador Ativo
            </DialogTitle>
            <DialogDescription>
              Você pode modificar todos os dados do sistema.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeactivate}
              className="flex items-center gap-2"
            >
              <ShieldOff className="h-4 w-4" />
              Desativar Modo Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Ativar Modo Administrador
          </DialogTitle>
          <DialogDescription>
            Digite o código de administrador para habilitar modificações.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="admin-code">Código de Administrador</Label>
            <Input
              id="admin-code"
              type="password"
              placeholder="Digite o código"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleActivate()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleActivate} disabled={loading || !code}>
            {loading ? "Verificando..." : "Ativar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
