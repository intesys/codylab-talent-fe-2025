import { useState, useEffect } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  Navigate,
} from "react-router-dom";
import classes from "./App.module.css";
import { useMsal } from "@azure/msal-react";
import { ManualgetAuthState } from "./lib/api/msalInstance";
import { UserForm } from "./components/UserForm";
import { UserTasksInfo } from "./components/UserTasksInfo";
import { Workload } from "./pages/Workload";
import { TaskForm } from "./components/TaskForm";
import { WorkloadContexts } from "./pages/WorkloadContext";
import { TaskInfo } from "./components/TaskInfo";
import { UserInfo } from "./components/UserInfo";
import { ProjectForm } from "./components/ProjectForm";
import { ProjectInfo } from "./components/ProjectInfo";
import { Projects } from "./pages/Projects";
import { ProjectsContext } from "./pages/ProjectsContext";
import { Header } from "./components/Header";

// ... tus imports components

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const { instance, inProgress } = useMsal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    console.log("🔍 App State:", { inProgress, isAuthenticated, appLoading });

    const checkAuth = () => {
      const authState = ManualgetAuthState();
      console.log("🔐 Auth State:", authState);

      if (authState.isAuthenticated) {
        setIsAuthenticated(true);
        setAppLoading(false);
        return;
      }

      if (inProgress === "none" && !authState.isAuthenticated) {
        console.log("🔐 Non autenticato - mostro schermata login");
        setIsAuthenticated(false);
        setAppLoading(false);
        return;
      }

      if (inProgress === "login") {
        console.log("🔄 Login in corso...");
        setAppLoading(true);
      }
    };

    if (inProgress === "startup") {
      return;
    }

    checkAuth();
  }, [inProgress]);

  // 🔹 Loading durante inizializzazione
  if (inProgress === "startup" || appLoading) {
    return (
      <div
        className={classes.app}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div className="text-center">
          <div className="spinner"></div>
          <p>Inizializzazione Azure AD...</p>
        </div>
      </div>
    );
  }

  // 🔹 Schermata di LOGIN
  if (!isAuthenticated) {
    return (
      <div
        className={classes.app}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "2rem",
        }}
      >
        <div className="text-center">
          <h1>La Mia App</h1>
          <p>Accedi per continuare</p>
        </div>

        <button
          onClick={() => {
            console.log("🔄 Cliccato pulsante login manuale");
            manualLogin();
          }}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            backgroundColor: "#0078d4",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Accedi con Azure AD
        </button>
      </div>
    );
  }

  // 🔹 App principale (AUTENTICATO)
  return (
    <div className={classes.app}>
      <Router>
        <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <Routes>
          {/* 🔹 CORREGGI: Aggiungi Navigate per la root */}
          <Route path="/" element={<Navigate to="/projects" replace />} />

          {/* Projects Routes */}
          <Route element={<ProjectsContext />}>
            <Route
              path="/projects"
              element={<Projects searchTerm={searchTerm} />}
            />
            <Route path="/projects/add" element={<ProjectForm />} />
            <Route path="/projects/:projectId" element={<ProjectInfo />} />
            <Route
              path="/projects/:projectId/tasks/add"
              element={<TaskForm />}
            />
            <Route path="/project/:id/edit" element={<ProjectForm />} />
          </Route>

          {/* Tasks Routes */}
          <Route path="/tasks/:taskId" element={<TaskInfo />} />
          <Route path="/task/:id/edit" element={<TaskForm />} />

          {/* Workload Routes */}
          <Route element={<WorkloadContexts />}>
            <Route
              path="/workload"
              element={<Workload searchTerm={searchTerm} />}
            />
            <Route path="/workload/user/:userId" element={<UserInfo />} />
            <Route path="/workload/task/:taskId" element={<UserTasksInfo />} />
            <Route path="/workload/add" element={<UserForm />} />
            <Route path="/workload/:id/edit" element={<UserForm />} />
          </Route>

          {/* 🔹 Aggiungi una route 404 fallback */}
          <Route path="*" element={<div>Pagina non trovata</div>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
