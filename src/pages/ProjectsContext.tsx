import { createContext, useEffect, useState, useCallback } from "react";
import type { Projects } from "../generated/api";
import { projects } from "../lib/api/api";
import { Outlet } from "react-router-dom";
import { useAuth } from "../assets/hooks/useAuth";

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
  const { getAccessToken } = useAuth();
  const [projectsData, setProjectsData] = useState<Projects[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        console.error("Impossibile ottenere l'access token");
        setProjectsData([]);
        return;
      }

      const res = await projects.getProjects(
        {
          pageNumber: 0,
          size: 10,
          sort: "id",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProjectsData(res || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

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
