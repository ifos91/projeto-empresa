// =============================================
// PÁGINA PRINCIPAL - CONTROLE DE PRESENÇA E PAGAMENTOS
// Sistema de gestão de funcionários, presença e pagamentos
// Inclui exportação/importação de dados e geração de PDFs
// =============================================

import { useState, useEffect } from "react";
import { Employee, WeekRecord, HistoryRecord, DailyRecord } from "@/types";
import { Sale, SalesRanking } from "@/types/sales";
import { storage } from "@/lib/storage";
import { supabaseStorage } from "@/lib/supabaseStorage";
import { salesStorage } from "@/lib/salesStorage";
import { generateCurrentWeekPDF, generateHistoryPDF } from "@/lib/pdfGenerator";
import { AddEmployeeDialog } from "@/components/AddEmployeeDialog";
import { SettingsDialog } from "@/components/SettingsDialog";
import { AttendanceTable } from "@/components/AttendanceTable";
import { HistoryTable } from "@/components/HistoryTable";
import { AdminModeDialog } from "@/components/AdminModeDialog";
import { AddSaleDialog } from "@/components/AddSaleDialog";
import { SalesTable } from "@/components/SalesTable";
import { SupabaseConfigDialog } from "@/components/SupabaseConfigDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useAdminMode } from "@/hooks/useAdminMode";
import { toast } from "sonner";
import { Save, Printer, Calendar, LogOut, Download, Upload, Trash2, FileText, Shield, ShieldCheck, DollarSign, Database } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { isAdminModeActive, canModify, activateAdminMode, deactivateAdminMode } = useAdminMode();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentWeek, setCurrentWeek] = useState<WeekRecord[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [salesRanking, setSalesRanking] = useState<SalesRanking[]>([]);
  const [dailyRate, setDailyRate] = useState(70);
  const [dataLoading, setDataLoading] = useState(true);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [addSaleDialogOpen, setAddSaleDialogOpen] = useState(false);
  const [supabaseConfigDialogOpen, setSupabaseConfigDialogOpen] = useState(false);

  // Carregar dados ao iniciar a aplicação
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Função para carregar todos os dados do banco
  const loadData = async () => {
    try {
      const [employeesData, weekData, historyData, salesData, rankingData] = await Promise.all([
        supabaseStorage.getEmployees(),
        supabaseStorage.getCurrentWeek(),
        supabaseStorage.getHistory(),
        salesStorage.getSales(),
        salesStorage.getSalesRanking(),
      ]);
      
      setEmployees(employeesData);
      setCurrentWeek(weekData);
      setHistory(historyData);
      setSales(salesData);
      setSalesRanking(rankingData);
      setDailyRate(storage.getSettings().dailyRate);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setDataLoading(false);
    }
  };

  const createEmptyWeekRecord = (employee: Employee): WeekRecord => {
    const emptyDay: DailyRecord = { present: false, advance: 0, extra: 0 };
    return {
      employeeId: employee.id,
      employeeName: employee.name,
      days: {
        monday: { ...emptyDay },
        tuesday: { ...emptyDay },
        wednesday: { ...emptyDay },
        thursday: { ...emptyDay },
        friday: { ...emptyDay },
        saturday: { ...emptyDay },
        sunday: { ...emptyDay },
      },
      totalDays: 0,
      totalAdvances: 0,
      totalExtras: 0,
      netTotal: 0,
    };
  };

  const calculateTotals = (record: WeekRecord): WeekRecord => {
    const totalDays = Object.values(record.days).filter((d) => d.present).length;
    const totalAdvances = Object.values(record.days).reduce((sum, d) => sum + d.advance, 0);
    const totalExtras = Object.values(record.days).reduce((sum, d) => sum + (d.extra || 0), 0);
    const netTotal = totalDays * dailyRate - totalAdvances + totalExtras;

    return { ...record, totalDays, totalAdvances, totalExtras, netTotal };
  };

  const addEmployee = async (name: string) => {
    if (!canModify) {
      toast.error("Ative o modo administrador para modificar dados");
      setAdminDialogOpen(true);
      return;
    }
    
    try {
      const newEmployee = await supabaseStorage.saveEmployee(name);
      const newRecord = createEmptyWeekRecord(newEmployee);
      
      await supabaseStorage.saveWeekRecord(newRecord);
      
      setEmployees([...employees, newEmployee]);
      setCurrentWeek([...currentWeek, newRecord]);

      toast.success(`${name} foi adicionado com sucesso.`);
    } catch (error) {
      console.error("Error adding employee:", error);
      toast.error("Erro ao adicionar funcionário");
    }
  };

  const removeEmployee = async (employeeId: string) => {
    if (!canModify) {
      toast.error("Ative o modo administrador para modificar dados");
      setAdminDialogOpen(true);
      return;
    }
    
    try {
      await supabaseStorage.deleteEmployee(employeeId);
      await supabaseStorage.deleteWeekRecord(employeeId);
      
      setEmployees(employees.filter((e) => e.id !== employeeId));
      setCurrentWeek(currentWeek.filter((r) => r.employeeId !== employeeId));

      toast.success("Funcionário removido com sucesso.");
    } catch (error) {
      console.error("Error removing employee:", error);
      toast.error("Erro ao remover funcionário");
    }
  };

  const updatePresence = async (employeeId: string, day: string, present: boolean) => {
    if (!canModify) {
      toast.error("Ative o modo administrador para modificar dados");
      setAdminDialogOpen(true);
      return;
    }
    
    const updatedWeek = currentWeek.map((record) => {
      if (record.employeeId === employeeId) {
        const updatedRecord = {
          ...record,
          days: {
            ...record.days,
            [day]: { ...record.days[day as keyof typeof record.days], present },
          },
        };
        return calculateTotals(updatedRecord);
      }
      return record;
    });

    setCurrentWeek(updatedWeek);
    
    const recordToUpdate = updatedWeek.find(r => r.employeeId === employeeId);
    if (recordToUpdate) {
      await supabaseStorage.saveWeekRecord(recordToUpdate);
    }
  };

  const updateAdvance = async (employeeId: string, day: string, amount: number) => {
    if (!canModify) {
      toast.error("Ative o modo administrador para modificar dados");
      setAdminDialogOpen(true);
      return;
    }
    
    const updatedWeek = currentWeek.map((record) => {
      if (record.employeeId === employeeId) {
        const updatedRecord = {
          ...record,
          days: {
            ...record.days,
            [day]: { ...record.days[day as keyof typeof record.days], advance: amount },
          },
        };
        return calculateTotals(updatedRecord);
      }
      return record;
    });

    setCurrentWeek(updatedWeek);
    
    const recordToUpdate = updatedWeek.find(r => r.employeeId === employeeId);
    if (recordToUpdate) {
      await supabaseStorage.saveWeekRecord(recordToUpdate);
    }
  };

  const updateExtra = async (employeeId: string, day: string, amount: number) => {
    if (!canModify) {
      toast.error("Ative o modo administrador para modificar dados");
      setAdminDialogOpen(true);
      return;
    }
    
    const updatedWeek = currentWeek.map((record) => {
      if (record.employeeId === employeeId) {
        const updatedRecord = {
          ...record,
          days: {
            ...record.days,
            [day]: { ...record.days[day as keyof typeof record.days], extra: amount },
          },
        };
        return calculateTotals(updatedRecord);
      }
      return record;
    });

    setCurrentWeek(updatedWeek);
    
    const recordToUpdate = updatedWeek.find(r => r.employeeId === employeeId);
    if (recordToUpdate) {
      await supabaseStorage.saveWeekRecord(recordToUpdate);
    }
  };

  const closeWeek = async () => {
    if (!canModify) {
      toast.error("Ative o modo administrador para modificar dados");
      setAdminDialogOpen(true);
      return;
    }
    
    if (currentWeek.length === 0) {
      toast.error("Não há registros na semana atual.");
      return;
    }

    try {
      const weekNumber = history.length > 0 ? Math.max(...history.map((h) => h.weekNumber)) + 1 : 1;
      const closedAt = new Date().toISOString();

      const newHistory: HistoryRecord[] = currentWeek.map((record) => ({
        ...record,
        weekNumber,
        closedAt,
      }));

      await supabaseStorage.saveHistoryRecords(newHistory);
      await supabaseStorage.clearCurrentWeek();

      setHistory([...history, ...newHistory]);
      setCurrentWeek([]);

      toast.success(`Semana ${weekNumber} foi fechada e movida para o histórico.`);
    } catch (error) {
      console.error("Error closing week:", error);
      toast.error("Erro ao fechar semana");
    }
  };

  const clearHistory = async () => {
    if (!canModify) {
      toast.error("Ative o modo administrador para modificar dados");
      setAdminDialogOpen(true);
      return;
    }
    
    try {
      await supabaseStorage.clearHistory();
      setHistory([]);
      toast.success("Histórico zerado com sucesso!");
    } catch (error) {
      console.error("Error clearing history:", error);
      toast.error("Erro ao zerar histórico");
    }
  };

  const exportCurrentWeek = () => {
    const dataStr = JSON.stringify({ currentWeek, dailyRate }, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `semana_atual_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Semana atual exportada com sucesso!");
  };

  const importCurrentWeek = () => {
    if (!canModify) {
      toast.error("Ative o modo administrador para modificar dados");
      setAdminDialogOpen(true);
      return;
    }
    
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event: any) => {
          try {
            const data = JSON.parse(event.target.result);
            if (data.currentWeek && Array.isArray(data.currentWeek)) {
              for (const record of data.currentWeek) {
                await supabaseStorage.saveWeekRecord(record);
              }
              setCurrentWeek(data.currentWeek);
              if (data.dailyRate) {
                setDailyRate(data.dailyRate);
                storage.saveSettings({ dailyRate: data.dailyRate });
              }
              toast.success("Semana atual importada com sucesso!");
            } else {
              toast.error("Arquivo inválido");
            }
          } catch (error) {
            console.error("Error importing:", error);
            toast.error("Erro ao importar arquivo");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const savePDF = (type: "current" | "history") => {
    try {
      const doc = type === "current" 
        ? generateCurrentWeekPDF(currentWeek, dailyRate)
        : generateHistoryPDF(history, dailyRate);
      
      const fileName = type === "current" 
        ? `semana_atual_${new Date().toISOString().split("T")[0]}.pdf`
        : `historico_${new Date().toISOString().split("T")[0]}.pdf`;
      
      doc.save(fileName);
      toast.success(`O relatório foi salvo como ${fileName}`);
    } catch (error) {
      toast.error("Não foi possível gerar o PDF. Tente novamente.");
    }
  };

  const printPDF = (type: "current" | "history") => {
    try {
      const doc = type === "current" 
        ? generateCurrentWeekPDF(currentWeek, dailyRate)
        : generateHistoryPDF(history, dailyRate);
      
      doc.autoPrint();
      window.open(doc.output("bloburl"), "_blank");
      toast.success("O relatório foi aberto em uma nova janela para impressão.");
    } catch (error) {
      toast.error("Não foi possível abrir o PDF para impressão.");
    }
  };

  const updateDailyRate = (rate: number) => {
    setDailyRate(rate);
    storage.saveSettings({ dailyRate: rate });
    
    const updatedWeek = currentWeek.map((record) => calculateTotals(record));
    setCurrentWeek(updatedWeek);

    toast.success(`Valor da diária definido como R$ ${rate.toFixed(2)}`);
  };

  // =============================================
  // FUNÇÕES DE VENDAS
  // =============================================

  const addSale = async (
    employeeId: string,
    employeeName: string,
    amount: number,
    date: string,
    description?: string
  ) => {
    if (!canModify) {
      toast.error("Ative o modo administrador para modificar dados");
      setAdminDialogOpen(true);
      return;
    }

    try {
      await salesStorage.createSale({
        employeeId,
        employeeName,
        saleAmount: amount,
        saleDate: date,
        description,
        userId: user!.id,
      });

      // Recarregar dados
      const [salesData, rankingData] = await Promise.all([
        salesStorage.getSales(),
        salesStorage.getSalesRanking(),
      ]);

      setSales(salesData);
      setSalesRanking(rankingData);
      toast.success("Venda registrada com sucesso!");
    } catch (error) {
      console.error("Error adding sale:", error);
      toast.error("Erro ao registrar venda");
    }
  };

  const deleteSale = async (id: string) => {
    if (!canModify) {
      toast.error("Ative o modo administrador para modificar dados");
      setAdminDialogOpen(true);
      return;
    }

    try {
      await salesStorage.deleteSale(id);

      // Recarregar dados
      const [salesData, rankingData] = await Promise.all([
        salesStorage.getSales(),
        salesStorage.getSalesRanking(),
      ]);

      setSales(salesData);
      setSalesRanking(rankingData);
      toast.success("Venda excluída com sucesso!");
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast.error("Erro ao excluir venda");
    }
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
        <header className="text-center space-y-2">
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate("/audit-logs")}>
              <FileText className="h-5 w-5" />
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Sucata Benevides
            </h1>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSupabaseConfigDialogOpen(true)}
                title="Configurar Supabase"
              >
                <Database className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setAdminDialogOpen(true)}
                className={isAdminModeActive ? "text-green-500" : ""}
                title="Modo Administrador"
              >
                {isAdminModeActive ? <ShieldCheck className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={signOut} title="Sair">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">
            Controle de presença e pagamentos de funcionários
          </p>
        </header>

        <Card className="p-4 bg-gradient-header">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <AddEmployeeDialog onAdd={addEmployee} />
              <SettingsDialog dailyRate={dailyRate} onSave={updateDailyRate} />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-primary-foreground">
              <span>Valor da Diária: R$ {dailyRate.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="current" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">Semana Atual</TabsTrigger>
            <TabsTrigger value="sales">Vendas</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <div className="flex flex-wrap gap-2 justify-end">
              <Button onClick={exportCurrentWeek} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button onClick={importCurrentWeek} variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Importar
              </Button>
              <Button onClick={closeWeek} variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Fechar Semana
              </Button>
              <Button onClick={() => savePDF("current")} variant="outline">
                <Save className="mr-2 h-4 w-4" />
                Salvar PDF
              </Button>
              <Button onClick={() => printPDF("current")} variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
            </div>
            
            <AttendanceTable
              records={currentWeek}
              dailyRate={dailyRate}
              onUpdatePresence={updatePresence}
              onUpdateAdvance={updateAdvance}
              onUpdateExtra={updateExtra}
              onRemoveEmployee={removeEmployee}
            />
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <div className="flex flex-wrap gap-2 justify-end">
              <Button onClick={() => setAddSaleDialogOpen(true)}>
                <DollarSign className="mr-2 h-4 w-4" />
                Registrar Venda
              </Button>
            </div>
            
            <SalesTable 
              sales={sales} 
              ranking={salesRanking}
              onDeleteSale={deleteSale}
              canModify={canModify}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex flex-wrap gap-2 justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Zerar Histórico
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Todo o histórico será permanentemente deletado.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={clearHistory}>
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button onClick={() => savePDF("history")} variant="outline">
                <Save className="mr-2 h-4 w-4" />
                Salvar PDF
              </Button>
              <Button onClick={() => printPDF("history")} variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
            </div>
            
            <HistoryTable history={history} />
          </TabsContent>
        </Tabs>

        <AdminModeDialog
          open={adminDialogOpen}
          onOpenChange={setAdminDialogOpen}
          isAdminModeActive={isAdminModeActive}
          onActivate={activateAdminMode}
          onDeactivate={deactivateAdminMode}
        />

        <AddSaleDialog
          open={addSaleDialogOpen}
          onOpenChange={setAddSaleDialogOpen}
          onAddSale={addSale}
          employees={employees}
        />

        <SupabaseConfigDialog
          open={supabaseConfigDialogOpen}
          onOpenChange={setSupabaseConfigDialogOpen}
        />
      </div>
    </div>
  );
};

export default Index;
