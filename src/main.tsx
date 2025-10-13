import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { msalConfig } from "./authConfig";
import "./index.css";

const msalInstance = new PublicClientApplication(msalConfig);

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </StrictMode>
);

export { msalInstance };
