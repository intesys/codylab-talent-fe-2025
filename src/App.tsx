import { useState } from "react";
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

function App() {
  const [searchTerm, setSearchTerm] = useState("");
 const { loading, authenticated } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!authenticated) {
    return <p>Accesso non autorizzato</p>;
  }
  return (
    <div className={classes.app}>
      <Router>
        <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <Routes>
          <Route element={<ProjectsContext />}>
            <Route path="/" element={<Projects searchTerm={searchTerm} />}>
              <Route path="projects/:projectId" element={<ProjectInfo />} />
              <Route path="tasks/:taskId" element={<TaskInfo />} />
            </Route>
            <Route path="/projects/add" element={<ProjectForm />} />
            <Route
              path="/projects/:projectId/tasks/add"
              element={<TaskForm />}
            />
            <Route path="/project/:id/edit" element={<ProjectForm />} />
            <Route path="/task/:id/edit" element={<TaskForm />} />
          </Route>

          <Route element={<WorkloadContexts />}>
            <Route
              path="/workload"
              element={<Workload searchTerm={searchTerm} />}
            >
              <Route path="/workload/user/:userId" element={<UserInfo />} />
              <Route path="/workload/task/:taskId" element={<UserTasksInfo />} />
            </Route>
            <Route path="/workload/add" element={<UserForm />} />
            <Route path="/workload/:id/edit" element={<UserForm />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
