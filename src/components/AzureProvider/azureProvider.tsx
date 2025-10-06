import { InteractionType, IPublicClientApplication } from "@azure/msal-browser";
import { MsalAuthenticationTemplate, MsalProvider } from "@azure/msal-react";
import { ReactNode } from "react";
import { loginRequest } from "../../lib/api/msalInstance";
import { authEnabled } from "./authEnabled";
import { GraphProvider } from "./GraphProvider";

interface aZureProviderProps {
  msalInstance: IPublicClientApplication;
  children: React.ReactNode;
}

export const AzureProvider = ({
  children,
  msalInstance,
}: AzureProviderProps) => {
  if (!authEnabled()) {
    console.log("Testing Mode: skipping MsalProvider");
    return (
      <GraphProvider msalInstance={msalInstance}>{children}</GraphProvider>
    );
  }

  return (
    <MsalProvider instance={msalInstance}>
      <MsalAuthenticationTemplate
        interactionType={InteractionType.Redirect}
        authenticationRequest={loginRequest}
      >
        <GraphProvider msalInstance={msalInstance}>{children}</GraphProvider>
      </MsalAuthenticationTemplate>
    </MsalProvider>
  );
};
