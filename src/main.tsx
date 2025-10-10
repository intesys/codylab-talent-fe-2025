import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { MsalProvider } from "@azure/msal-react";
import App from "./App";
import { msalInstance, initializeMsal } from "./lib/api/msalInstance";
import "./index.css";

async function bootstrapApp() {
  try {
    console.log("🚀 Avvio applicazione...");

    // 🔹 Inizializza MSAL con timeout
    const msalPromise = initializeMsal();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout MSAL")), 10000)
    );

    await Promise.race([msalPromise, timeoutPromise]);
    console.log("✅ MSAL inizializzato");
  } catch (error) {
    console.error("❌ Errore inizializzazione MSAL:", error);
    // Continua comunque
  }

  // 🔹 Renderizza sempre l'app
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </StrictMode>
  );
}

bootstrapApp();
