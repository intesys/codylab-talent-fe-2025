import type { Projects } from "../generated/api/models/Projects";
import type { Tasks } from "../generated/api/models/Tasks";
import GanntRender from "./GanntRender";
import classes from "./ProjectCard.module.css" ;
import { useNavigate, useParams } from "react-router-dom";


export function ProjectCard({
  project,
  onProjectClick, onTaskClick
}: {
  project: Projects;
  onProjectClick: (project: Projects) => void; onTaskClick: (task: Tasks) => void
}) {
  const navigate = useNavigate();
  const {projectId, taskId} = useParams();

  const handleNewTaskClick = () => {
    navigate(`/projects/${project.id}/tasks/add`, {
      state: { projectId: project.id },
    });
  };

  return (
    <section className={`${classes.project} ${project.id?.toString() === projectId ? classes.active : ""}`}>
      <div className={classes.ContentWrapper} >
        <div className={classes.ProjectInformation}>
          <h2 onClick={() => onProjectClick(project)}>{project.name}</h2>
          <div className={classes.tasks}>
            <ul>
              {project.tasks?.map((task) => (
                <li key={task.id} onClick={() => onTaskClick(task)} className={task.id?.toString() === taskId ? classes.active : ""}>
                  {task.name}
                </li>
              ))}
            </ul>
            <p className={classes.newTask} onClick={handleNewTaskClick}>Nuova Task</p>
          </div>
        </div>
        <div className={classes.GanntContainer}>
            <GanntRender />
        </div>
      </div>
</section>
  );
}
