// =============================================
// PÁGINA DE LOGS DE AUDITORIA
// Exibe histórico completo de modificações
// Mostra quem fez o quê e quando
// =============================================

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabaseStorage } from "@/lib/supabaseStorage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AuditLogs() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Carregar logs quando a página for montada
  useEffect(() => {
    if (user) {
      loadLogs();
    }
  }, [user]);

  // Função para carregar logs de auditoria
  const loadLogs = async () => {
    try {
      const data = await supabaseStorage.getAuditLogs();
      setLogs(data);
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
      toast.error("Erro ao carregar logs de auditoria");
    } finally {
      setDataLoading(false);
    }
  };

  // Traduzir ações para português
  const translateAction = (action: string): string => {
    const translations: Record<string, string> = {
      create: "Criação",
      update: "Atualização",
      delete: "Exclusão",
      close_week: "Fechar Semana",
      clear_history: "Zerar Histórico",
    };
    return translations[action] || action;
  };

  // Traduzir tipos de entidade para português
  const translateEntityType = (type: string): string => {
    const translations: Record<string, string> = {
      employee: "Funcionário",
      week_record: "Registro Semanal",
      week_records: "Registros Semanais",
      history_records: "Histórico",
    };
    return translations[type] || type;
  };

  // Exportar logs para arquivo de texto
  const exportLogs = () => {
    let content = "HISTÓRICO DE MODIFICAÇÕES - SUCATA BENEVIDES\n";
    content += "=" .repeat(80) + "\n\n";
    
    logs.forEach((log) => {
      const date = new Date(log.created_at).toLocaleString("pt-BR");
      content += `Data/Hora: ${date}\n`;
      content += `Usuário: ${log.user_email}\n`;
      content += `Ação: ${translateAction(log.action)}\n`;
      content += `Tipo: ${translateEntityType(log.entity_type)}\n`;
      if (log.entity_name) {
        content += `Nome: ${log.entity_name}\n`;
      }
      if (log.details) {
        content += `Detalhes: ${JSON.stringify(log.details, null, 2)}\n`;
      }
      content += "-".repeat(80) + "\n\n";
    });

    // Criar e baixar arquivo
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `logs_auditoria_${new Date().toISOString().split("T")[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Logs exportados com sucesso!");
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Logs de Auditoria
              </h1>
              <p className="text-muted-foreground mt-2">
                Histórico completo de modificações no sistema
              </p>
            </div>
            <Button onClick={exportLogs} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar para TXT
            </Button>
          </div>
        </header>

        <Card className="shadow-card">
          <div className="bg-gradient-header p-4">
            <h2 className="text-lg font-semibold text-primary-foreground">
              Registro de Atividades
            </h2>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">
                    {new Date(log.created_at).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-sm">{log.user_email}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {translateAction(log.action)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {translateEntityType(log.entity_type)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.entity_name || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {log.details ? JSON.stringify(log.details) : "-"}
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    Nenhum log de auditoria disponível.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
