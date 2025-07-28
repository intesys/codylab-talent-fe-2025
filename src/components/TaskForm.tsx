import { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TasksStateEnum, type Tasks } from "../generated/api";
import { tasks } from "../lib/api/api";
import { ProjectsDataContext } from "../pages/ProjectsContext";
import classes from "./TaskForm.module.css";

export function TaskForm() {
  const navigate = useNavigate();
  const { id: taskId, projectId } = useParams();

  // Ora destrutturi anche refreshProjects dal contesto
  const { projectsData, refreshProjects } = useContext(ProjectsDataContext);

  const currentTask = projectsData
    .flatMap((project) => project.tasks || [])
    .find((t) => t.id?.toString() === taskId);

  const today = new Date().toISOString().slice(0, 10);

  // Funzione helper per convertire Date in formato YYYY-MM-DD
  const formatDateForInput = (date: string | Date): string => {
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
    startDate: today,
    duration: 0,
    state: TasksStateEnum.InProgress,
  };

  // Inizializza formData con la data formattata correttamente
  const [formData, setFormData] = useState(() => {
    if (currentTask) {
      return {
        ...currentTask,
        startDate: formatDateForInput(currentTask.startDate)
      };
    }
    return emptyState;
  });

  // Debug: mostra i parametri URL
  console.log("URL params:", { taskId, projectId });
  console.log("Current task:", currentTask);
  console.log("Form data:", formData);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "duration" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalProjectId = currentTask?.projectId || projectId;
    console.log("Final project ID:", finalProjectId);

    if (!finalProjectId) {
      alert("Project ID mancante!");
      return;
    }

    const save = currentTask
      ? (task: { tasks: Tasks }) => {
          console.log("Updating task:", task);
          return tasks.updateTask({ id: currentTask.id!, tasks: task.tasks });
        }
      : (task: { tasks: Tasks }) => {
          console.log("Creating task:", task);
          return tasks.createTask(task);
        };

    const taskData = {
      tasks: {
        ...formData,
        // Converti la stringa della data in oggetto Date per l'API
        // Aggiungi l'orario per evitare problemi di timezone
        startDate: formData.startDate ? new Date(formData.startDate + "T00:00:00.000Z") : new Date(),
        projectId: typeof finalProjectId === "string" ? Number(finalProjectId) : finalProjectId,
      },
    };

    console.log("Task data to save:", taskData);

    try {
      const result = await save(taskData);
      console.log("Save result:", result);

      // Ricarica i progetti dopo il salvataggio
      await refreshProjects();
      console.log("Projects refreshed");

      alert("Task salvato!");
      navigate("/");
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Errore durante il salvataggio del task.");
    }
  };

  return (
    <div className={classes.task_form}>
      <form onSubmit={handleSubmit}>
        <label>Codice Task</label>
        <input
          type="text"
          name="code"
          value={formData.code}
          onChange={handleChange}
          required
        />

        <label>Nome Task</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label>Descrizione</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
        />

        <label>Data Inizio</label>
        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          required
        />

        <label>Durata (giorni)</label>
        <input
          type="number"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          required
        />

        <label>Stato</label>
        <select name="state" value={formData.state} onChange={handleChange}>
          <option value={TasksStateEnum.InProgress}>In corso</option>
          <option value={TasksStateEnum.Completed}>Completato</option>
          <option value={TasksStateEnum.Deleted}>Eliminato</option>
        </select>

        <button className={classes.addBtn} type="submit">
          {currentTask ? "Aggiorna Task" : "Crea Task"}
        </button>
      </form>
    </div>
  );
}
