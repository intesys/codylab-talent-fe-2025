import { useState, useEffect } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import classes from "./App.module.css";
import { useAuth } from "./assets/hooks/useAuth";

import { Header } from "./components/Header";
import { ProjectForm } from "./components/ProjectForm";
import { ProjectInfo } from "./components/ProjectInfo";
import { TaskForm } from "./components/TaskForm";
import { TaskInfo } from "./components/TaskInfo";
import { UserInfo } from "./components/UserInfo";
import { UserTasksInfo } from "./components/UserTasksInfo";
import { Projects } from "./pages/Projects";
import { ProjectsContext } from "./pages/ProjectsContext";
import { Workload } from "./pages/Workload";
import { WorkloadContexts } from "./pages/WorkloadContext";
import { UserForm } from "./components/UserForm";
import {
  msalInstance,
  loginRequest,
  initializeMsal,
} from "./lib/api/msalInstance";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [msalInitialized, setMsalInitialized] = useState(false);
  const { loading, authenticated } = useAuth();

  // 🔹 Inizializza MSAL UNA SOLA VOLTA all'avvio
  useEffect(() => {
    const setupMsal = async () => {
      try {
        console.log("🔄 Inizializzazione MSAL in App...");

        // Inizializza MSAL (usa la funzione dal modulo)
        await initializeMsal();

        // Gestisci il redirect da Azure AD (se presente)
        const redirectResponse = await msalInstance.handleRedirectPromise();

        if (redirectResponse) {
          console.log(
            "✅ Redirect completato, utente:",
            redirectResponse.account?.username
          );
          // L'account è già stato impostato dall'event callback
        } else {
          // Non siamo in un redirect, controlla se c'è un account
          const accounts = msalInstance.getAllAccounts();

          if (accounts.length === 0) {
            console.log("⚠️ Nessun account trovato, avvio login...");
            // Nessun account, avvia il login
            await msalInstance.loginRedirect(loginRequest);
            return; // Il redirect interromperà l'esecuzione
          } else {
            console.log("✅ Account già presente:", accounts[0].username);
            msalInstance.setActiveAccount(accounts[0]);
          }
        }

        setMsalInitialized(true);
      } catch (error) {
        console.error("❌ Errore inizializzazione MSAL:", error);
        setMsalInitialized(true); // Imposta comunque per evitare blocchi
      }
    };

    initializeMsal();
  }, []); // ✅ Array vuoto = esegue SOLO una volta

  // 🔹 Mostra loading mentre MSAL si inizializza
  if (!msalInitialized) {
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
        <p>Inizializzazione autenticazione...</p>
      </div>
    );
  }

  // 🔹 Mostra loading mentre useAuth controlla lo stato
  if (loading) {
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
        <p>Caricamento...</p>
      </div>
    );
  }

  // 🔹 Se non autenticato (non dovrebbe succedere se MSAL funziona)
  if (!authenticated) {
    return (
      <div
        className={classes.app}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <p>Accesso non autorizzato</p>
        <button onClick={() => msalInstance.loginRedirect(loginRequest)}>
          Accedi nuovamente
        </button>
      </div>
    );
  }

  // 🔹 Utente autenticato, mostra l'app
  return (
    <div className={classes.app}>
      <Router>
        <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <Routes>
          {/* Projects */}
          <Route element={<ProjectsContext />}>
            <Route path="/" element={<Projects searchTerm={searchTerm} />} />
            <Route path="/projects/add" element={<ProjectForm />} />
            <Route path="/projects/:projectId" element={<ProjectInfo />} />
            <Route
              path="/projects/:projectId/tasks/add"
              element={<TaskForm />}
            />
            <Route path="/tasks/:taskId" element={<TaskInfo />} />
            <Route path="/project/:id/edit" element={<ProjectForm />} />
            <Route path="/task/:id/edit" element={<TaskForm />} />
          </Route>

          {/* Workload */}
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
        </Routes>
      </Router>
    </div>
  );
}

export default App;
