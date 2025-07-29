import { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import classes from "./ProjectForm.module.css";
import { ProjectsStateEnum, type Projects, } from "../generated/api";
import { projects } from "../lib/api/api";
import { ProjectsDataContext } from "../pages/ProjectsContext";

export function ProjectForm() {
  const navigate = useNavigate();
  const {id: projectId} = useParams();

  const {projectsData, refreshProjects} = useContext(ProjectsDataContext);

  const currentProject = projectsData.find((p)=>p.id?.toString() === projectId);

  const today = new Date().toISOString().slice(0,10);

  const formatDateForInput = (date: string | Date | null | undefined): string => {
    if (!date) return today;
    if (typeof date === 'string') {
      // Se è già una stringa, assumiamo sia nel formato corretto
      if (date.includes('T')) {
        return date.slice(0, 10);
      }
      return date;
    }
    if (date instanceof Date) {
      return date.toISOString().slice(0, 10);
    }
    return today;
  };

  const emptyState = {
    code: "",
    name: "",
    description: "",
    startDate: "",
    duration: 0,
    manager: "",
    state: ProjectsStateEnum.Open,
  };

  const [formData, setFormData] = useState(()=>{
    if(currentProject){
      return{
        ...currentProject,
        startDate: formatDateForInput(currentProject.startDate)
      }
    }
    return emptyState
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "duration" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const save = currentProject ? (project: {projects: Projects}) => {
      return projects.updateProject({id: currentProject.id!, projects: project.projects})
    } 
    : (project : {projects: Projects}) => {
      return projects.createProject(project);
    };

    const projectData = {
      projects: {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate + "T00:00:00.000Z") : new Date(),
      }
    }
    try {
      const result = await save(projectData);
      await refreshProjects();
      alert("Projetto salvato");
      navigate("/");
    } catch (error) {
      alert("Errore durante il salvataggio del progetto.");
    }
  };

  return (
    <div className={classes.project_form}>
      <form onSubmit={handleSubmit}>
        <label>Codice progetto</label>
        <input type="text" name="code" value={formData.code} onChange={handleChange} required />

        <label>Nome progetto</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />

        <label>Descrizione</label>
        <input type="text" name="description" value={formData.description} onChange={handleChange} />

        <label>Data di inizio</label>
        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />

        <label>Durata (giorni)</label>
        <input type="number" name="duration" value={formData.duration} onChange={handleChange} required />

        <label>Responsabile</label>
        <input type="text" name="manager" value={formData.manager} onChange={handleChange} />

        <label>Stato</label>
        <select name="state" value={formData.state} onChange={handleChange}>
          <option value={ProjectsStateEnum.Open}>Open</option>
          <option value={ProjectsStateEnum.Closed}>Closed</option>
          <option value={ProjectsStateEnum.Deleted}>Deleted</option>
        </select>

        <button className={classes.addBtn} type="submit">{currentProject ? "Aggiorna Progetto" : "Crea Progetto"}</button>
      </form>
    </div>
  );
}