// =============================================
// DIÁLOGO DE MODO ADMINISTRADOR
// Interface para ativar/desativar modo admin
// SEGURANÇA: Não usa código hardcoded, verifica role no banco
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
import { Button } from "@/components/ui/button";
import { Shield, ShieldOff, ShieldCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

interface AdminModeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdminModeActive: boolean;
  onActivate: () => Promise<boolean>;
  onDeactivate: () => void;
}

export function AdminModeDialog({
  open,
  onOpenChange,
  isAdminModeActive,
  onActivate,
  onDeactivate,
}: AdminModeDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    setLoading(true);
    
    try {
      const success = await onActivate();
      
      if (success) {
        toast.success("Modo administrador ativado!");
        onOpenChange(false);
      } else {
        toast.error("Você não tem permissão de administrador. Contate um admin para receber acesso.");
      }
    } catch (error) {
      console.error("Error activating admin mode:", error);
      toast.error("Erro ao verificar permissões de administrador");
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
              <ShieldCheck className="h-5 w-5 text-green-500" />
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
            Clique no botão abaixo para verificar se você tem permissão de administrador.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-md">
            <ShieldAlert className="h-4 w-4 flex-shrink-0" />
            <span>
              As permissões de administrador são gerenciadas no banco de dados. 
              Se você não tem acesso, contate um administrador existente.
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleActivate} disabled={loading}>
            {loading ? "Verificando..." : "Verificar Permissão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
