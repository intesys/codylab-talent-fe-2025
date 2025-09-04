import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Projects } from "../generated/api/models/Projects";
import type { Tasks } from "../generated/api/models/Tasks";
import { GanttChart } from "./GanttChart";
import classes from "./ProjectCard.module.css";

const DEFAULT_START = "2025-06-01";
const DEFAULT_COLOR = "#BDBDBD"; // grigio per task senza chiave persistente

const randomColor = (): string =>
  `#${Array.from({ length: 6 })
    .map(() => "0123456789ABCDEF"[Math.floor(Math.random() * 16)])
    .join("")}`;

export function ProjectCard({
  project,
  onProjectClick,
  onTaskClick,
}: {
  project: Projects;
  onProjectClick: (project: Projects) => void;
  onTaskClick: (task: Tasks) => void;
}) {
  const navigate = useNavigate();
  const { projectId, taskId } = useParams();

  const [ganttTasks, setGanttTasks] = useState<
    { id: string; name: string; start: string; end: string; color: string }[]
  >([]);

  const storageKey = `gantt_colors_project_${project?.id ?? "global"}`;

  const readColorMap = (): Record<string, string> => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const writeColorMap = (map: Record<string, string>) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(map));
    } catch {}
  };

  useEffect(() => {
    if (!project?.tasks) {
      setGanttTasks([]);
      return;
    }

    const colorMap = readColorMap();
    const prevColorCount = Object.keys(colorMap).length;

    const tasksForGantt = project.tasks.map((task, idx) => {
      const stableKey =
        task.id !== undefined && task.id !== null
          ? `id:${task.id}`
          : task.name
          ? `name:${task.name}`
          : null;

      if (stableKey && !colorMap[stableKey]) {
        colorMap[stableKey] = randomColor();
      }

      const start =
        task.startDate && !isNaN(new Date(task.startDate).getTime())
          ? new Date(task.startDate).toISOString().slice(0, 10)
          : DEFAULT_START;

      const duration = task.duration ?? 1;
      const end = new Date(
        new Date(start).getTime() + duration * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .slice(0, 10);

      const color = stableKey ? colorMap[stableKey] : DEFAULT_COLOR;
      const ganttId = stableKey ?? `idx:${idx}`;

      return {
        id: ganttId,
        name: task.name ?? "Nuova Task",
        start,
        end,
        color,
      };
    });

    if (Object.keys(colorMap).length !== prevColorCount) writeColorMap(colorMap);
    setGanttTasks(tasksForGantt);
  }, [project?.tasks]);

  const handleNewTaskClick = (): void => {
    navigate(`/projects/${project.id}/tasks/add`, {
      state: { projectId: project.id },
    });
  };

  const listKey = (task: Tasks, idx: number): string =>
    task.id !== undefined && task.id !== null
      ? `id:${task.id}`
      : task.name
      ? `name:${task.name}`
      : `idx:${idx}`;

  // 🔹 riferimenti per sincronizzare altezza
  const listRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const gantt = ganttRef.current;
    if (!list || !gantt) return;

    const maxHeight = Math.max(list.scrollHeight, gantt.scrollHeight);
    list.style.height = `${maxHeight}px`;
    gantt.style.height = `${maxHeight}px`;
  }, [project?.tasks, ganttTasks]);

  return (
    <section
      className={`${classes.project} ${
        project.id?.toString() === projectId ? classes.active : ""
      }`}
    >
      <div className={classes.ContentWrapper}>
        <h2 onClick={() => onProjectClick(project)}>{project.name}</h2>

        <div className={classes.ProjectWrapper}>
          <div className={classes.ProjectInformation} ref={listRef}>
            <div className={classes.tasks}>
              <ul>
                <div style={{ width: "100px", height: "70px" }} />
                {project.tasks?.map((task, idx) => (
                  <li
                    key={listKey(task, idx)}
                    onClick={() => onTaskClick(task)}
                    className={
                      task.id?.toString() === taskId ? classes.active : ""
                    }
                  >
                    {task.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={classes.GanntContainer} ref={ganttRef}>
            <div className={classes.ganttInnerContainer}>
              <GanttChart
                tasks={ganttTasks}
                startDate={DEFAULT_START}
                endDate="2025-07-31"
              />
            </div>
          </div>
        </div>

        <button className={classes.newTask} onClick={handleNewTaskClick}>
          Nuova Task
        </button>
      </div>
    </section>
  );
}
