export interface GanttTask {
  id: string;
  name: string;
  start: string | Date;
  end: string | Date;
  color?: string;
}

export interface TimelineMonth {
  label: string;
  start: Date;
  end: Date;
  daysInMonth: number;
}

export interface TimelineDay {
  date: Date;
  day: number;
  isWeekend: boolean;
}

export interface EnhancedGanttProps {
  tasks: GanttTask[];
  startDate: Date | string;
  endDate: Date | string;
}
