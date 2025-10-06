import { IPublicClientApplication } from "@azure/msal-browser";
import { Client } from "@microsoft/microsoft-graph-client";
import { createContext, FC, ReactNode, useContext, useMemo } from "react";
import { useGraphInstance } from "./useGraphInstance";

type GraphProviderProps = {
  msalInstance: IPublicClientApplication;
  children: ReactNode;
};

export type GraphProviderContext = {
  graphInstance: Client | null;
  msalInstance: IPublicClientApplication | null;
};

export const GraphContext = createContext<GraphProviderContext>({
  graphInstance: null,
  msalInstance: null,
});

export const GraphProvider: FC<GraphProviderProps> = ({
  children,
  msalInstance,
}) => {
  const graphInstance = useGraphInstance();

  const providerValue = useMemo<GraphProviderContext>(
    () => ({
      graphInstance,
      msalInstance,
    }),
    [graphInstance, msalInstance]
  );

  return (
    <GraphContext.Provider value={providerValue}>
      {children}
    </GraphContext.Provider>
  );
};

export const useGraph = () => useContext(GraphContext);
