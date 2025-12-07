import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { WeekRecord, HistoryRecord } from "@/types";

export const generateCurrentWeekPDF = (records: WeekRecord[], dailyRate: number) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text("Relatório da Semana Atual", 14, 20);
  
  // Date
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 28);
  doc.text(`Valor da Diária: R$ ${dailyRate.toFixed(2)}`, 14, 34);
  
  // Table data
  const tableData = records.map(record => [
    record.employeeName,
    record.totalDays.toString(),
    `R$ ${(record.totalDays * dailyRate).toFixed(2)}`,
    `R$ ${record.totalAdvances.toFixed(2)}`,
    `R$ ${record.totalExtras.toFixed(2)}`,
    `R$ ${record.netTotal.toFixed(2)}`,
  ]);
  
  autoTable(doc, {
    startY: 40,
    head: [["Funcionário", "Dias Trab.", "Total Diárias", "Total Vales", "Total Extras", "Total Líquido"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235] },
  });
  
  return doc;
};

export const generateHistoryPDF = (history: HistoryRecord[], dailyRate: number) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text("Histórico de Semanas", 14, 20);
  
  // Date
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 28);
  
  // Table data
  const tableData = history.map(record => [
    `Semana ${record.weekNumber}`,
    record.employeeName,
    record.totalDays.toString(),
    `R$ ${record.totalAdvances.toFixed(2)}`,
    `R$ ${record.totalExtras.toFixed(2)}`,
    `R$ ${record.netTotal.toFixed(2)}`,
    new Date(record.closedAt).toLocaleString("pt-BR"),
  ]);
  
  autoTable(doc, {
    startY: 34,
    head: [["Semana", "Funcionário", "Dias Trab.", "Total Vales", "Total Extras", "Total Líquido", "Fechado em"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235] },
  });
  
  return doc;
};
