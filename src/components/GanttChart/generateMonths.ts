type GenerateMonths = (
  projectStart: dayjs.Dayjs,
  projectEnd: dayjs.Dayjs
) => TimelineMonth[];
import type dayjs from "dayjs";
import type { TimelineMonth } from "../Types";

// Genera timeline mesi
export const generateMonths: GenerateMonths = (projectStart, projectEnd) => {
  const months: TimelineMonth[] = [];
  let current = projectStart.startOf("month");

  while (current.isSameOrBefore(projectEnd, "day")) {
    const monthStart = current.startOf("month");
    const monthEnd = current.endOf("month");
    const daysInMonth = monthEnd.diff(monthStart, "day") + 1;

    months.push({
      label: current.format("MMM YYYY").toUpperCase(),
      start: monthStart.toDate(),
      end: monthEnd.toDate(),
      daysInMonth,
    });

    current = current.add(1, "month").startOf("month");
  }

  return months;
};
