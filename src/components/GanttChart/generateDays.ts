import type dayjs from "dayjs";
import type { TimelineDay } from "../Types";

type GenerateDays = (projectStart: dayjs.Dayjs, projectEnd: dayjs.Dayjs) => TimelineDay[];

// Genera giorni con weekend evidenziati
  export const generateDays: GenerateDays = (projectStart, projectEnd) => {
    const days: TimelineDay[] = [];
    let current = projectStart;

    while (current.isSameOrBefore(projectEnd, 'day')) {
      days.push({
        date: current.toDate(),
        day: current.date(),
        isWeekend: current.day() === 0 || current.day() === 6
      });
      current = current.add(1, 'day');
    }

    return days;
  };
