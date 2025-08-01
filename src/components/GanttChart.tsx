import React from 'react';
import styles from './GanttChart.module.css';
import { type GanttTask, type TimelineMonth, type TimelineDay } from './Types';

interface GanttProps {
  tasks: GanttTask[];
  startDate: string | Date;
  endDate: string | Date;
}

const GanttChart: React.FC<GanttProps> = ({ tasks, startDate, endDate }) => {
  // Normalizzazione date
  const projectStart = new Date(startDate);
  const projectEnd = new Date(endDate);
  const totalDays = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Genera timeline mesi
  const generateMonths = (): TimelineMonth[] => {
    const months: TimelineMonth[] = [];
    let current = new Date(projectStart);

    while (current <= projectEnd) {
      const year = current.getFullYear();
      const month = current.getMonth();
      const lastDay = new Date(year, month + 1, 0).getDate();

      months.push({
        label: current.toLocaleString('it-IT', { month: 'short' }).toUpperCase() + ' ' + year,
        start: new Date(current),
        end: new Date(year, month, lastDay),
        daysInMonth: lastDay
      });

      current = new Date(year, month + 1, 1);
    }

    return months;
  };

  // Genera giorni con weekend evidenziati
  const generateDays = (): TimelineDay[] => {
    const days: TimelineDay[] = [];
    let current = new Date(projectStart);

    while (current <= projectEnd) {
      days.push({
        date: new Date(current),
        day: current.getDate(),
        isWeekend: current.getDay() === 0 || current.getDay() === 6
      });
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const months = generateMonths();
  const days = generateDays();

  // Calcola posizione temporale (0-100%)
  const calculatePosition = (date: Date): number => {
    const diff = date.getTime() - projectStart.getTime();
    return (diff / (projectEnd.getTime() - projectStart.getTime())) * 100;
  };

  return (
    <div className={styles.ganttContainer}>
      {/* Timeline - Mesi */}
      <div className={styles.timelineMonths}>
        {months.map((month) => (
          <div
            key={month.label}
            className={styles.month}
            style={{
              width: `${(month.daysInMonth / totalDays) * 100}%`
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
              width: `${(1 / totalDays) * 100}%`
            }}
          >
            {day.day}
          </div>
        ))}
      </div>

      {/* Barre dei task */}
      <div className={styles.tasksContainer}>
        {tasks.map((task) => {
          const start = new Date(task.start);
          const end = new Date(task.end);
          const left = calculatePosition(start);
          const width = calculatePosition(end) - left;

          return (
            <div
              key={task.id}
              className={styles.taskBar}
              style={{
                left: `${left}%`,
                width: `${width}%`,
                backgroundColor: task.color || '#4CAF50'
              }}
            >
              <span className={styles.taskLabel}>{task.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GanttChart;
