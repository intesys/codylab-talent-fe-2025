import { createContext, useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import type { Users } from "../generated/api";
import { users } from "../lib/api/api";

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
  const [workloadData, setWorkloadData] = useState<Users[]>([]);
  const [loading, setLoading] = useState(false);

  const loadWorkload = useCallback(async () => {
    setLoading(true);
      const res = await users.getUsers({
        pageNumber: 0,
        size: 10,
        sort: "id",
      });
      setWorkloadData(res || []);
  }, []);

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
