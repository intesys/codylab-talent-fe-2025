import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Projects } from "../generated/api/models/Projects";
import type { Tasks } from "../generated/api/models/Tasks";
import { GanttChart } from "./GanttChart";
import classes from "./ProjectCard.module.css";

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

  const [ganttTasks, setGanttTasks] = useState<{
    id: string;
    name: string;
    start: string;
    end: string;
    color: string;
  }[]>([]);

  useEffect(() => {
    if (project.tasks) {
      const tasksForGantt = project.tasks.map((task) => {
        // Calcolo start in modo sicuro
        let start: string;
        if (task.startDate) {
          const tempDate = new Date(task.startDate);
          start = isNaN(tempDate.getTime())
            ? "2025-06-01" // fallback se invalida
            : tempDate.toISOString().slice(0, 10);
        } else {
          start = "2025-06-01"; // default se undefined/null
        }

        // Duration di default 1 giorno
        const duration = task.duration ?? 1;
        const end = new Date(new Date(start).getTime() + duration * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10);

        return {
          id: task.id?.toString() ?? `task-${Date.now()}`,
          name: task.name ?? "Nuova Task",
          start,
          end,
          color: "#2196F3",
        };
      });
      setGanttTasks(tasksForGantt);
    }
  }, [project.tasks]);

  const handleNewTaskClick = () => {
    navigate(`/projects/${project.id}/tasks/add`, {
      state: { projectId: project.id },
    });
  };

  return (
    <section
      className={`${classes.project} ${
        project.id?.toString() === projectId ? classes.active : ""
      }`}
    >
      <div className={classes.ContentWrapper}>
        <h2 onClick={() => onProjectClick(project)}>{project.name}</h2>

        <div className={classes.ProjectWrapper}>
          <div className={classes.ProjectInformation}>
            <div className={classes.tasks}>
              <ul>
                {/* Modifica per lo spazio  */}
                <div style={{ width: "100px", height: "70px" }}></div> 
                {project.tasks?.map((task) => (
                  <li
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className={task.id?.toString() === taskId ? classes.active : ""}
                  >
                    {task.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className={classes.GanntContainer}>
            <div className={classes.ganttInnerContainer}>
              <GanttChart
                tasks={ganttTasks}
                startDate="2025-06-01"
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