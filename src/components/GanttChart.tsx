import React from 'react';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import styles from './GanttChart.module.css';
import { type GanttTask, type TimelineMonth, type TimelineDay } from './Types';

// Estendi dayjs con i plugin necessari
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

interface GanttProps {
  tasks: GanttTask[];
  startDate: string | Date | dayjs.Dayjs;
  endDate: string | Date | dayjs.Dayjs;
}

const GanttChart: React.FC<GanttProps> = ({ tasks, startDate, endDate }) => {
  // Normalizzazione date con dayjs
  const projectStart = dayjs(startDate).startOf('day');
  const projectEnd = dayjs(endDate).endOf('day');
  const totalDays = projectEnd.diff(projectStart, 'day') + 1; // +1 per includere entrambi i giorni estremi

  // Genera timeline mesi
  const generateMonths = (): TimelineMonth[] => {
    const months: TimelineMonth[] = [];
    let current = projectStart.startOf('month');

    while (current.isSameOrBefore(projectEnd, 'day')) {
      const monthStart = current.startOf('month');
      const monthEnd = current.endOf('month');
      const daysInMonth = monthEnd.diff(monthStart, 'day') + 1;

      months.push({
        label: current.format('MMM YYYY').toUpperCase(),
        start: monthStart.toDate(),
        end: monthEnd.toDate(),
        daysInMonth
      });

      current = current.add(1, 'month').startOf('month');
    }

    return months;
  };

  // Genera giorni con weekend evidenziati
  const generateDays = (): TimelineDay[] => {
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

  const months = generateMonths();
  const days = generateDays();

  // Calcola il numero di giorni dall'inizio del progetto
  const getDayOffset = (date: dayjs.Dayjs | Date): number => {
    const normalizedDate = dayjs(date).startOf('day');
    return normalizedDate.diff(projectStart, 'day', true); // Precisione decimale
  };

  // Calcola posizione e larghezza in base ai giorni
  const calculateTaskStyle = (start: dayjs.Dayjs | Date, end: dayjs.Dayjs | Date) => {
    const startDay = Math.max(0, getDayOffset(start));
    const endDay = Math.min(totalDays, getDayOffset(dayjs(end).endOf('day')) + 1); // +1 per includere tutto l'ultimo giorno
    const dayWidth = 100 / totalDays;

    return {
      left: `${startDay * dayWidth}%`,
      width: `${Math.max(0, (endDay - startDay) * dayWidth)}%`,
    };
  };

  // Calcola la larghezza totale in pixel
  const totalWidth = totalDays * 30; // 30px per giorno

  return (
    <div className={styles.ganttOuterContainer}>
      <div className={styles.ganttScrollContainer} style={{ width: `${totalWidth}px` }}>
        {/* Timeline - Mesi */}
        <div className={styles.timelineMonths}>
          {months.map((month) => (
            <div
              key={month.label}
              className={styles.month}
              style={{
                width: `${(month.daysInMonth / totalDays) * 100}%`,
                minWidth: `${month.daysInMonth * 30}px`
              }}
            >
              {month.label}
            </div>
          ))}
        </div>

        {/* Timeline - Giorni */}
        <div className={styles.timelineDays}>
          {days.map((day) => (
            <div
              key={day.date.toString()}
              className={`${styles.day} ${day.isWeekend ? styles.weekend : ''}`}
              style={{
                width: `${(1 / totalDays) * 100}%`,
                minWidth: '30px'
              }}
            >
              {day.day}
            </div>
          ))}
        </div>

        {/* Barre dei task */}
        <div className={styles.tasksContainer}>
          {tasks.map((task) => {
            const start = dayjs(task.start).startOf('day');
            const end = dayjs(task.end).endOf('day');

            return (
              <div key={task.id} className={styles.taskRow} style={{ height: '40px' }}>
                <div
                  className={styles.taskBar}
                  style={{
                    ...calculateTaskStyle(start, end),
                    backgroundColor: task.color || '#4CAF50',
                    top: '50%',
                    zIndex: 2,
                    transform: 'translateY(-50%)'
                  }}
                >
                  <span className={styles.taskLabel}>{task.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
