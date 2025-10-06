import { useMsal } from "@azure/msal-react";
import { useCallback } from "react";
import { graphRequest, loginRequest } from "../../lib/api/msalInstance";
import { authEnabled } from "./authEnabled";

export enum AccessTokenType {
  api = "api",
  graph = "graph",
}

export const useGetAccessToken = (type: AccessTokenType) => {
  const { accounts, instance: msalInstance } = useMsal();

  const request = type === AccessTokenType.api ? loginRequest : graphRequest;

  const cb = useCallback(async () => {
    // Azure accessToken flow
    const authenticationResult = await msalInstance
      .acquireTokenSilent({ ...request, account: accounts[0] })
      .catch((/* error */) => {
        // Cleaning all data in storage should take you back to Login and (hopefully) fix #139
        sessionStorage.clear();
        return msalInstance.acquireTokenRedirect({ ...request });
      });

    return authenticationResult?.accessToken ?? "";
  }, [accounts, msalInstance, request]);

  if (!authEnabled()) {
    return () => "";
  }

  return cb;
};
