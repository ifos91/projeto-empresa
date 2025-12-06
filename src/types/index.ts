export interface Employee {
  id: string;
  name: string;
}

export interface DailyRecord {
  present: boolean;
  advance: number;
}

export interface WeekRecord {
  employeeId: string;
  employeeName: string;
  days: {
    monday: DailyRecord;
    tuesday: DailyRecord;
    wednesday: DailyRecord;
    thursday: DailyRecord;
    friday: DailyRecord;
    saturday: DailyRecord;
    sunday: DailyRecord;
  };
  totalDays: number;
  totalAdvances: number;
  netTotal: number;
}

export interface HistoryRecord extends WeekRecord {
  weekNumber: number;
  closedAt: string;
}

export interface Settings {
  dailyRate: number;
}
