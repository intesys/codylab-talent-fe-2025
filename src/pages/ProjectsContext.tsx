import { createContext, useEffect, useState, useCallback } from "react";
import type { Projects } from "../generated/api";
import { projects } from "../lib/api/api";
import { Outlet } from "react-router-dom";
import { msalInstance } from "../main";

declare global {
  interface Window {
    __projectErrorHandled?: boolean;
  }
}

interface ProjectsContextType {
  projectsData: Projects[];
  refreshProjects: () => Promise<void>;
  loading: boolean;
}

export const ProjectsDataContext = createContext<ProjectsContextType>({
  projectsData: [],
  refreshProjects: async () => {},
  loading: false,
});

export function ProjectsContext() {
  const [projectsData, setProjectsData] = useState<Projects[]>([]);
  const [loading, setLoading] = useState(false);

const loadProjects = useCallback(async () => {
  setLoading(true);
  try {
    const res = await projects.getProjects({
      pageNumber: 0,
      size: 10,
      sort: "id",
    });
    setProjectsData(res || []);
  } catch (error: any) {
    if (!window.__projectErrorHandled) {
      window.__projectErrorHandled = true;

      alert("Sessione scaduta o errore di autorizzazione. Verrai reindirizzato al login.");
      const accounts = msalInstance.getAllAccounts();
      sessionStorage.clear();
      localStorage.clear();
      if (accounts.length > 0) {
        msalInstance.logoutRedirect({
          account: accounts[0],
          postLogoutRedirectUri: window.location.origin,
        });
      } else {
        window.location.href = window.location.origin;
      }
  }
  }
}, []);



  const refreshProjects = useCallback(async () => {
    await loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <ProjectsDataContext.Provider
      value={{
        projectsData,
        refreshProjects,
        loading,
      }}
    >
      <Outlet />
    </ProjectsDataContext.Provider>
  );
}
