import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import React, { useCallback, useMemo } from "react";
import styles from "./GanttChart.module.css";
import { generateDays } from "./GanttChart/generateDays";
import { generateMonths } from "./GanttChart/generateMonths";
// import { type GanttTask } from "./Types";
import { useNavigate } from "react-router-dom";
import type { Tasks } from "../generated/api";

// Estendi dayjs con i plugin necessari
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

interface GanttProps {
  tasks: Tasks[];
  startDate: string | Date | dayjs.Dayjs;
  endDate: string | Date | dayjs.Dayjs;
}

export const GanttChart: React.FC<GanttProps> = ({
  tasks,
  startDate,
  endDate,
}) => {
  const navigate = useNavigate();
  // Normalizzazione date con dayjs
  const projectStart = dayjs(startDate).startOf("day");
  const projectEnd = dayjs(endDate).endOf("day");
  const totalDays = projectEnd.diff(projectStart, "day") + 1; // +1 per includere entrambi i giorni estremi

  const months = useMemo(
    () => generateMonths(projectStart, projectEnd),
    [projectStart, projectEnd]
  );
  const days = useMemo(
    () => generateDays(projectStart, projectEnd),
    [projectStart, projectEnd]
  ); // Aggiornato con useMemo per ottimizzazione generateDays(projectStart, projectEnd);

  // Calcola il numero di giorni dall'inizio del progetto
  const getDayOffset = useCallback(
    (date: dayjs.Dayjs | Date): number => {
      const normalizedDate = dayjs(date).startOf("day");
      return normalizedDate.diff(projectStart, "day", true); // Precisione decimale
    },
    [projectStart]
  );

  // Calcola posizione e larghezza in base ai giorni
  const calculateTaskStyle = useCallback(
    (start: dayjs.Dayjs | Date, end: dayjs.Dayjs | Date) => {
      const startDay = Math.max(0, getDayOffset(start));
      const endDay = Math.min(
        totalDays,
        getDayOffset(dayjs(end).endOf("day"))
      );
      const dayWidth = 100 / totalDays;

      return {
        left: `${startDay * dayWidth}%`,
        width: `${Math.max(0, (endDay - startDay) * dayWidth)}%`,
      };
    },
    [getDayOffset, totalDays]
  );

  // Calcola la larghezza totale in pixel
  const totalWidth = totalDays * 30; // 30px per giorno

  return (
    <div className={styles.ganttOuterContainer}>
      <div
        className={styles.ganttScrollContainer}
        style={{ width: `${totalWidth}px` }}
      >
        {/* Timeline - Mesi */}
        <div className={styles.timelineMonths}>
          {months.map((month) => (
            <div
              key={month.label}
              className={styles.month}
              style={{
                width: `${(month.daysInMonth / totalDays) * 100}%`,
                minWidth: `${month.daysInMonth * 30}px`,
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
              className={`${styles.day} ${day.isWeekend ? styles.weekend : ""}`}
              style={{
                width: `${(1 / totalDays) * 100}%`,
                minWidth: "30px",
              }}
            >
              {day.day}
            </div>
          ))}
        </div>

        {/* Barre dei task */}
        <div className={styles.tasksContainer}>
          {tasks.map((task) => {
            const start = dayjs(task.startDate).startOf("day");
            const end = dayjs(task.startDate)
              .add(task.duration ?? 0, "day")
              .endOf("day");

            return (
              <div
                key={task.id}
                className={styles.taskRow}
                style={{ height: "40px" }}
              >
                <div
                  className={styles.taskBar}
                  style={{
                    ...calculateTaskStyle(start, end),
                    backgroundColor: task.state === "in  progress" ? "blue" : task.state === "completed" ? "green" : "red",
                    top: "50%",
                    zIndex: 2,
                    transform: "translateY(-50%)",
                    textAlign: "center"
                  }}
                  onClick={() => navigate(`/tasks/${task.id}`)}
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
