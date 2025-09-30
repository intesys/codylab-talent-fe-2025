import { useForm } from "@tanstack/react-form";
import { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProjectsStateEnum, type Projects } from "../generated/api";
import { projects } from "../lib/api/api";
import { ProjectsDataContext } from "../pages/ProjectsContext";
import classes from "./ProjectForm.module.css";

export function ProjectForm() {
  const navigate = useNavigate();
  const { id: projectId } = useParams();

  const { projectsData, refreshProjects } = useContext(ProjectsDataContext);

  const currentProject = projectsData.find(
    (p) => p.id?.toString() === projectId
  );

  const today = new Date().toISOString().slice(0, 10);

  const formatDateForInput = (
    date: string | Date | null | undefined
  ): string => {
    if (!date) return today;
    if (typeof date === "string") {
      // Se è già una stringa, assumiamo sia nel formato corretto
      if (date.includes("T")) {
        return date.slice(0, 10);
      }
      return date;
    }
    if (date instanceof Date) {
      return date.toISOString().slice(0, 10);
    }
    return today;
  };

  const defaultValues = currentProject
    ? {
        code: currentProject.code ?? "",
        name: currentProject.name ?? "",
        description: currentProject.description ?? "",
        startDate: formatDateForInput(currentProject.startDate),
        duration: currentProject.duration ?? 0,
        manager: currentProject.manager ?? "",
        state: currentProject.state ?? ProjectsStateEnum.Open,
      }
    : {
        code: "",
        name: "",
        description: "",
        startDate: today,
        duration: 0,
        manager: "",
        state: ProjectsStateEnum.Open,
      };

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const save = currentProject
        ? (project: { projects: Projects }) => {
            return projects.updateProject({
              id: currentProject.id!,
              projects: project.projects,
            });
          }
        : (project: { projects: Projects }) => {
            return projects.createProject(project);
          };

      const projectData = {
        projects: {
          ...value,
          duration: Number(value.duration),
          startDate: value.startDate
            ? new Date(value.startDate + "T00:00:00.000Z")
            : new Date(),
        },
      };

      try {
        await save(projectData);
        await refreshProjects();
        alert("Progetto salvato");
        navigate("/");
      } catch (error) {
        alert("Errore durante il salvataggio del progetto.");
      }
    },
  });

  return (
    <div className={classes.project_form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.Field name="code">
          {(field) => (
            <>
              <label>Codice progetto</label>
              <input
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                required
              />
            </>
          )}
        </form.Field>

        <form.Field name="name">
          {(field) => (
            <>
              <label>Nome progetto</label>
              <input
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                required
              />
            </>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <>
              <label>Descrizione</label>
              <textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </>
          )}
        </form.Field>

        <form.Field name="startDate">
          {(field) => (
            <>
              <label>Data di inizio</label>
              <input
                type="date"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                required
              />
            </>
          )}
        </form.Field>

        <form.Field name="duration">
          {(field) => (
            <>
              <label>Durata (giorni)</label>
              <input
                type="number"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                required
              />
            </>
          )}
        </form.Field>

        <form.Field name="manager">
          {(field) => (
            <>
              <label>Responsabile</label>
              <input
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </>
          )}
        </form.Field>

        <form.Field name="state">
          {(field) => (
            <>
              <label>Stato</label>
              <select
                value={field.state.value}
                onChange={(e) =>
                  field.handleChange(e.target.value as ProjectsStateEnum)
                }
              >
                <option value={ProjectsStateEnum.Open}>Open</option>
                <option value={ProjectsStateEnum.Closed}>Closed</option>
                <option value={ProjectsStateEnum.Deleted}>Deleted</option>
              </select>
            </>
          )}
        </form.Field>

        <button className={classes.addBtn} type="submit">
          {currentProject ? "Aggiorna progetto" : "Crea progetto"}
        </button>
      </form>
    </div>
  );
}
