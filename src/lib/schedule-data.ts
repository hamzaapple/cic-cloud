import rawData from './schedule-data.json';

export interface ScheduleEntry {
  period: string;
  subject: string;
  instructor: string;
  location: string;
}

export type DaySchedule = ScheduleEntry[];

export type SectionSchedule = {
  [day: string]: DaySchedule;
};

export type SemesterSchedule = {
  [section: string]: SectionSchedule;
};

export type YearSchedule = {
  [semester: string]: SemesterSchedule;
};

export type DeptSchedule = {
  [year: string]: YearSchedule;
};

export type AllSchedules = DeptSchedule;

// Explicit casts to help TypeScript
export const csScheduleData = rawData.cs as unknown as DeptSchedule;
export const cyberScheduleData = rawData.cyber as unknown as DeptSchedule;
export const aiScheduleData = rawData.ai as unknown as DeptSchedule;

export const scheduleData = csScheduleData;

export const DAYS_ORDER = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];
export const PERIODS_ORDER = ["الفترة الأولى", "الفترة الثانية", "الفترة الثالثة", "الفترة الرابعة"];
