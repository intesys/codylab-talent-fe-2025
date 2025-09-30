import { useForm } from "@tanstack/react-form";
import { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TasksStateEnum, type Tasks, } from "../generated/api";
import { tasks } from "../lib/api/api";
import { ProjectsDataContext } from "../pages/ProjectsContext";
import classes from "./TaskForm.module.css";

export function TaskForm() {
  const navigate = useNavigate();
  const { id: taskId, projectId } = useParams();

  const { projectsData, refreshProjects } = useContext(ProjectsDataContext);

  const currentTask = projectsData
    .flatMap((project) => project.tasks || [])
    .find((t) => t.id?.toString() === taskId);

  const today = new Date().toISOString().slice(0, 10);

  // Funzione helper per convertire Date in formato YYYY-MM-DD
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

  const defaultValues = currentTask
    ? {
        code: currentTask.code ?? "",
        name: currentTask.name ?? "",
        description: currentTask.description ?? "",
        startDate: formatDateForInput(currentTask.startDate),
        duration: currentTask.duration ?? 0,
        state: currentTask.state ?? TasksStateEnum.InProgress,
      }
    : {
        code: "",
        name: "",
        description: "",
        startDate: today,
        duration: 0,
        state: TasksStateEnum.InProgress,
      };

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const finalProjectId = currentTask?.projectId || projectId;

      if (!finalProjectId) {
        alert("Project ID mancante!");
        return;
      }

      const save = currentTask
        ? (task: { tasks: Tasks }) => {
            return tasks.updateTask({ id: currentTask.id!, tasks: task.tasks });
          }
        : (task: { tasks: Tasks }) => {
            return tasks.createTask(task);
          };

      const taskData = {
        tasks: {
          ...value,
          startDate: value.startDate
            ? new Date(value.startDate + "T00:00:00.000Z")
            : new Date(),
          projectId:
            typeof finalProjectId === "string"
              ? Number(finalProjectId)
              : finalProjectId,
        },
      };

      try {
        await save(taskData);
        await refreshProjects();
        alert("Task salvato!");
        navigate("/");
      } catch (error) {
        console.error("Error saving task:", error);
        alert("Errore durante il salvataggio del task.");
      }
    },
  });

  return (
    <div className={classes.task_form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.Field name="code">
          {(field) => (
            <>
              <label>Codice Task</label>
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
              <label>Nome Task</label>
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
              <label>Descrizione Task</label>
              <textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                required
              />
            </>
          )}
        </form.Field>

        <form.Field name="startDate">
          {(field) => (
            <>
              <label>Data Inizio</label>
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
              <label>Durata</label>
              <input
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                required
              />
            </>
          )}
        </form.Field>
        
        <form.Field name="state">
          {(field) => (
            <>
              <label>Stato</label>
              <select
                name="state"
                value={field.state.value}
                onChange={(e) =>
                  field.handleChange(e.target.value as TasksStateEnum)
                }
              >
                <option value={TasksStateEnum.InProgress}>In corso</option>
                <option value={TasksStateEnum.Completed}>Completato</option>
                <option value={TasksStateEnum.Deleted}>Eliminato</option>
              </select>
            </>
          )}
        </form.Field>

        <button className={classes.addBtn} type="submit">
          {currentTask ? "Aggiorna Task" : "Crea Task"}
        </button>
      </form>
    </div>
  );
}
