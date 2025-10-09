import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { msalConfig } from "./authConfig";
import "./index.css";
import { Mode } from "./utils/EnableMode";
async function enableMocking() {
  if (import.meta.env.MODE !== Mode) return;

  const { worker } = await import("./mocks/browser");
  await worker.start();
}

const msalInstance = new PublicClientApplication(msalConfig);

// Avvia mocking e poi il rendering
enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <MsalProvider instance={msalInstance}>
      <StrictMode>
        <App />
      </StrictMode>
    </MsalProvider>
  );
});
