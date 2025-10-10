import { createContext, useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import type { Users } from "../generated/api";
import { users } from "../lib/api/api";
import { useAuth } from "../assets/hooks/useAuth";

interface WorkloadContextType {
  workloadData: Users[];
  refreshWorkload: () => Promise<void>;
  loading: boolean;
}

export const WorkloadContext = createContext<WorkloadContextType>({
  workloadData: [],
  refreshWorkload: async () => {},
  loading: false,
});

export function WorkloadContexts() {
  const { getAccessToken } = useAuth(); // ✅ dentro il componente
  const [workloadData, setWorkloadData] = useState<Users[]>([]);
  const [loading, setLoading] = useState(false);

  const loadWorkload = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAccessToken(); // ✅ prendi token
      if (!token) {
        console.error("Impossibile ottenere l'access token");
        setWorkloadData([]);
        setLoading(false);
        return;
      }

      const res = await users.getUsers(
        { pageNumber: 0, size: 10, sort: "id" },
        { headers: { Authorization: `Bearer ${token}` } } // ✅ header con token
      );

      setWorkloadData(res || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  const refreshWorkload = useCallback(async () => {
    await loadWorkload();
  }, [loadWorkload]);

  useEffect(() => {
    loadWorkload();
  }, [loadWorkload]);

  return (
    <WorkloadContext.Provider
      value={{ workloadData, refreshWorkload, loading }}
    >
      <Outlet />
    </WorkloadContext.Provider>
  );
}
