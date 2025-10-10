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

/**
 * Global configuration, loaded dynamically at startup
 */
export type GlobalConfig = {
  /**
   * API basepath
   * Examples:
   * - /api
   * - http://hostname.com/api
   */
  basePath: string;
  /**
   * Time slot for partial day requests
   */
  timeSlots: number;
  /**
   * Work hours for morning
   */
  morningSlot: { start: string; end: string };
  /**
   * Work hours for aftenoon
   */
  afternoonSlot: { start: string; end: string };
  /**
   * Authentication with Microsoft MSAL
   */
  msal: {
    enabled: boolean;
    clientId: string;
    authority: string;
    redirectUri: string;
    postLogoutRedirectUri: string;
    scopes: string[];
  };
};
