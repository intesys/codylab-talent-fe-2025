import {
  InteractionType,
  type IPublicClientApplication,
} from "@azure/msal-browser";
import { MsalAuthenticationTemplate, MsalProvider } from "@azure/msal-react";



import { loginRequest } from "../../lib/api/msalInstance";
import { GraphProvider } from "./graphProvider";
import authEnabled from "./authEnabled";

interface aZureProviderProps {
  msalInstance: IPublicClientApplication;
  children: React.ReactNode;
}

export const AzureProvider = ({
  children,
  msalInstance,
}: aZureProviderProps) => {
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
