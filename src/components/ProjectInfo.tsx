import { useContext, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import classes from "./ProjectInfo.module.css";
import { ProjectsDataContext } from "../pages/ProjectsContext";
import { projects } from "../lib/api/api";  // immagino che qui ci sia l'API Projects
import { ProjectsStateEnum, type Projects } from "../generated/api";


export function ProjectInfo() {
  const navigate = useNavigate();
  const { projectsData, refreshProjects } = useContext(ProjectsDataContext);
  const { projectId } = useParams();

  const project = projectsData.find(p => p.id?.toString() === projectId);

  const [selectedState, setSelectedState] = useState<ProjectsStateEnum | undefined>(project?.state);


  const onClose = () => {
    navigate("/");
  };

  const updateState = (projectId: number, newState: ProjectsStateEnum) => {
    if (!project) return;
    const updatedProject: Projects = { ...project, state: newState};
    projects.updateProject({ id: projectId, projects: updatedProject }).then(() => {
      refreshProjects();
      setSelectedState(newState);
    });
  };

  if (!project) {
    return <div>Progetto non trovato!</div>;
  }

  return (
    <div className={classes.sidebar}>
      <button className={classes.closeButton} onClick={onClose}>
        ×
      </button>
      <div className={classes.prj_name}>
        <h3>{project.name}</h3>
        <Link to={`/project/${project.id}/edit`}>
          <span className="material-symbols-outlined">edit</span>
        </Link>
      </div>
      <p><strong>ID:</strong> {project.id}</p>
      <p><strong>Codice:</strong> {project.code}</p>
      <p><strong>Manager:</strong> {project.manager}</p>
      <p><strong>Descrizione:</strong> {project.description || "Nessuna descrizione."}</p>
      <p><strong>Data di inizio:</strong> {project.startDate ? new Date(project.startDate).toLocaleDateString() : "Nessuna data di inizio."}</p>
      <p><strong>Durata:</strong> {project.duration || "Nessuna durata."} giorni</p>

      <form>
        <label>
          <strong>Stato:</strong>
          <select
            name="state"
            value={selectedState}
            onChange={(e) => {
              const newState = e.target.value as ProjectsStateEnum;
              setSelectedState(newState);
              updateState(Number(project.id), newState);
            }}
          >
            <option value={ProjectsStateEnum.Open}>Open</option>
            <option value={ProjectsStateEnum.Closed}>Closed</option>
            <option value={ProjectsStateEnum.Deleted}>Deleted</option>
          </select>
        </label>
      </form>
    </div>
  );
}
