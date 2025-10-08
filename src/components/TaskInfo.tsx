import { useContext, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { TasksStateEnum } from "../generated/api";
import { tasks } from "../lib/api/msalInstance";
import { ProjectsDataContext } from "../pages/ProjectsContext";
import classes from "./TaskInfo.module.css";

export function TaskInfo() {
  const navigate = useNavigate();
  const { projectsData, refreshProjects } = useContext(ProjectsDataContext);
  const { taskId } = useParams();

  const task = projectsData
    .flatMap((project) => project.tasks || [])
    .find((t) => t.id?.toString() === taskId);

  const [selectedState, setSelectedState] = useState<
    TasksStateEnum | undefined
  >(task?.state);

  const onClose = () => {
    navigate("/");
  };

  const updateState = (taskId: number, newState: TasksStateEnum) => {
    if (!task) return;
    const updatedTask = { ...task, state: newState };
    tasks.updateTask({ id: taskId, tasks: updatedTask }).then(() => {
      refreshProjects();
      setSelectedState(newState);
    });
  };

  if (!task) {
    return <div>Task non trovato!</div>;
  }

  return (
    <div className={classes.sidebar}>
      <button className={classes.closeButton} onClick={onClose}>
        ×
      </button>
      <div className={classes.task_name}>
        <h3>{task.name}</h3>
        <Link to={`/task/${task.id}/edit`}>
          <span className="material-symbols-outlined">edit</span>
        </Link>
      </div>
      <p>
        <strong>ID:</strong> {task.id}
      </p>
      <p>
        <strong>Codice:</strong> {task.code}
      </p>
      <p>
        <strong>Progetto:</strong> {task.projectId}
      </p>
      <p>
        <strong>Descrizione:</strong>{" "}
        {task.description || "Nessuna descrizione."}
      </p>
      <p>
        <strong>Data di inizio:</strong>{" "}
        {task.startDate
          ? new Date(task.startDate).toLocaleDateString()
          : "Nessuna data di inizio."}
      </p>
      <p>
        <strong>Durata:</strong> {task.duration || "Nessuna durata."} giorni
      </p>

      <form>
        <label>
          <strong>Stato:</strong>
          <select
            value={selectedState}
            onChange={(e) => {
              const newState = e.target.value as TasksStateEnum;
              updateState(Number(task.id), newState);
            }}
          >
            <option value={TasksStateEnum.InProgress}>In corso</option>
            <option value={TasksStateEnum.Completed}>Completato</option>
            <option value={TasksStateEnum.Deleted}>Eliminato</option>
          </select>
        </label>
      </form>
    </div>
  );
}
