import { Employee, WeekRecord, HistoryRecord, Settings } from "@/types";

const STORAGE_KEYS = {
  EMPLOYEES: "attendance_employees",
  CURRENT_WEEK: "attendance_current_week",
  HISTORY: "attendance_history",
  SETTINGS: "attendance_settings",
};

export const storage = {
  // Employees
  getEmployees: (): Employee[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return data ? JSON.parse(data) : [];
  },
  
  saveEmployees: (employees: Employee[]) => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  },

  // Current Week
  getCurrentWeek: (): WeekRecord[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_WEEK);
    return data ? JSON.parse(data) : [];
  },
  
  saveCurrentWeek: (records: WeekRecord[]) => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_WEEK, JSON.stringify(records));
  },

  // History
  getHistory: (): HistoryRecord[] => {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  },
  
  saveHistory: (history: HistoryRecord[]) => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  },

  // Settings
  getSettings: (): Settings => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : { dailyRate: 70 };
  },
  
  saveSettings: (settings: Settings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },
};
