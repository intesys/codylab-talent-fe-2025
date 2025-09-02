import { useNavigate, useParams } from "react-router-dom";
import type { Projects } from "../generated/api/models/Projects";
import type { Tasks } from "../generated/api/models/Tasks";
import { GanttChart } from "./GanttChart";
import classes from "./ProjectCard.module.css";
import { endDate, startDate, tasks } from "./projectCardMock";

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
                {project.tasks?.map((task) => (
                  <li
                    key={task.id}
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
          <div className={classes.GanntContainer}>
            <div className={classes.ganttInnerContainer}>
              <GanttChart
                tasks={tasks}
                startDate={startDate}
                endDate={endDate}
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
