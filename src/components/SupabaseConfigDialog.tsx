// =============================================
// DIÁLOGO DE CONFIGURAÇÃO DO SUPABASE
// Permite alterar credenciais do Supabase em runtime
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
import { Database, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SupabaseConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupabaseConfigDialog({
  open,
  onOpenChange,
}: SupabaseConfigDialogProps) {
  const [projectId, setProjectId] = useState(
    import.meta.env.VITE_SUPABASE_PROJECT_ID || ""
  );
  const [url, setUrl] = useState(import.meta.env.VITE_SUPABASE_URL || "");
  const [anonKey, setAnonKey] = useState(
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""
  );

  const handleSave = () => {
    // Validação básica
    if (!projectId || !url || !anonKey) {
      toast.error("Preencha todos os campos!");
      return;
    }

    if (!url.includes("supabase.co")) {
      toast.error("URL do Supabase inválida!");
      return;
    }

    toast.warning(
      "Para aplicar as novas configurações, você precisa reiniciar a aplicação.",
      {
        duration: 5000,
      }
    );

    toast.info(
      "Nota: Esta configuração só funciona em desenvolvimento. Para produção, configure as variáveis de ambiente no seu host.",
      {
        duration: 7000,
      }
    );

    // Salvar no localStorage para referência
    localStorage.setItem("supabase_project_id", projectId);
    localStorage.setItem("supabase_url", url);
    localStorage.setItem("supabase_anon_key", anonKey);

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configurar Supabase
          </DialogTitle>
          <DialogDescription>
            Configure as credenciais do seu projeto Supabase. Consulte o arquivo
            MIGRATION_GUIDE.md para instruções detalhadas.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Após salvar as configurações, você
            precisará reiniciar a aplicação e atualizar os arquivos .env e
            supabase/config.toml manualmente.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project-id">Project ID</Label>
            <Input
              id="project-id"
              placeholder="xxxxxxxxxxxxxxxxxxxxx"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Encontre em Settings → API no painel do Supabase
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-url">Project URL</Label>
            <Input
              id="project-url"
              placeholder="https://xxxxxxxxxxxxxxxxxxxxx.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              URL completa do seu projeto Supabase
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="anon-key">Anon/Public Key</Label>
            <Input
              id="anon-key"
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Chave pública (anon key) do projeto
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Próximos passos:</strong>
              <ol className="list-decimal ml-4 mt-2 space-y-1">
                <li>
                  Atualize o arquivo <code>.env</code> com as novas credenciais
                </li>
                <li>
                  Atualize <code>supabase/config.toml</code> com o project_id
                </li>
                <li>Reinicie o servidor de desenvolvimento</li>
                <li>
                  Consulte <code>MIGRATION_GUIDE.md</code> para mais detalhes
                </li>
              </ol>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Referência</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
