import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App";
import { Mode } from "./utils/EnableMode";
import "./index.css"
async function enableMocking() {
  if (import.meta.env.MODE !== Mode) return;

  const { worker } = await import("./mocks/browser");
  await worker.start();
}

// Avvia mocking e poi il rendering
enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
