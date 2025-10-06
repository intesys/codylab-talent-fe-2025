import { Client } from "@microsoft/microsoft-graph-client";
import { useMemo } from "react";
import { AccessTokenType, useGetAccessToken } from "./useGetAccessToken";

/**
 * generate a Graph API instance
 * @returns
 */
export const useGraphInstance = () => {
  const getAccessToken = useGetAccessToken(AccessTokenType.graph);

  return useMemo(() => {
    const graphClient = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          return getAccessToken();
        },
      },
    });

    return graphClient;
  }, [getAccessToken]);
};
