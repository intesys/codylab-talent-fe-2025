import { createContext, useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import type { Users } from "../generated/api";
import { users, getAccessToken } from "../lib/api/msalInstance";

interface WorkloadContextType {
  workloadData: Users[];
  refreshWorkload: () => Promise<void>;
  loading: boolean;
  error: string | null;
  debugUsersAPI: () => Promise<void>; // 🔹 ESPORTA LA FUNZIONE DI DEBUG
}

export const WorkloadContext = createContext<WorkloadContextType>({
  workloadData: [],
  refreshWorkload: async () => {},
  loading: false,
  error: null,
  debugUsersAPI: async () => {}, // 🔹 AGGIUNGI AL CONTEXT
});

// 🔍 FUNZIONE DI DEBUG MIGLIORATA
const debugUsersAPI = async (): Promise<{
  success: boolean;
  status?: number;
  error?: string;
}> => {
  try {
    console.log("🔍 === INIZIO DEBUG DETTAGLIATO API ===");

    const token = await getAccessToken();
    console.log("1. ✅ Token presente:", !!token);

    if (token) {
      console.log(
        "2. 🔑 Token (prime 30 chars):",
        token.substring(0, 30) + "..."
      );
      console.log("3. 📏 Token length:", token.length);

      // 🔹 DECODIFICA TOKEN JWT
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("4. 📄 Token payload:", payload);
        console.log("5. ⏰ Token scadenza:", new Date(payload.exp * 1000));
        console.log(
          "6. 🎯 Scopes nel token:",
          payload.scp || payload.roles || "Nessuno scope trovato"
        );
      } catch (e) {
        console.log("4. ❌ Token non decodificabile (probabilmente non JWT)");
      }
    } else {
      console.log("2. ❌ Nessun token disponibile");
    }

    const apiUrl = "/api/v1/users";
    console.log("7. 🌐 URL API:", apiUrl);

    // 🔹 TEST CON FETCH DIRETTO
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    console.log("8. 📊 Status Response:", response.status, response.statusText);
    console.log("9. 📋 Content-Type:", response.headers.get("content-type"));

    // 🔹 LOG HEADERS IMPORTANTI
    const headers = {
      "content-type": response.headers.get("content-type"),
      "www-authenticate": response.headers.get("www-authenticate"),
      "x-powered-by": response.headers.get("x-powered-by"),
    };
    console.log("10. 📨 Headers:", headers);

    const text = await response.text();
    console.log("11. 📝 Response (prime 500 chars):", text.substring(0, 500));

    // 🔹 ANALISI DETTAGLIATA DELLA RISPOSTA
    if (response.ok) {
      if (response.headers.get("content-type")?.includes("application/json")) {
        try {
          const jsonData = JSON.parse(text);
          console.log("12. ✅ SUCCESSO: JSON valido ricevuto");
          console.log("13. 📦 Dati ricevuti:", jsonData);
          return { success: true, status: response.status };
        } catch (e) {
          console.log("12. ❌ ERRORE: Content-Type JSON ma corpo non valido");
          return {
            success: false,
            status: response.status,
            error: "Invalid JSON",
          };
        }
      } else {
        console.log("12. ⚠️ AVVISO: Response OK ma non JSON");
        return {
          success: false,
          status: response.status,
          error: "Not JSON response",
        };
      }
    } else {
      console.log(
        `12. ❌ ERRORE HTTP: ${response.status} ${response.statusText}`
      );

      // 🔹 GESTIONE ERRORI SPECIFICI
      if (response.status === 401) {
        console.log("   🔐 401 Unauthorized: Token mancante o invalido");
      } else if (response.status === 403) {
        console.log("   🚫 403 Forbidden: Permessi insufficienti");
      } else if (response.status === 404) {
        console.log("   📍 404 Not Found: Route /api/v1/users non trovata");
      } else if (response.status === 500) {
        console.log("   💥 500 Server Error: Errore interno backend");
      }

      return {
        success: false,
        status: response.status,
        error: `HTTP ${response.status}`,
      };
    }
  } catch (error: any) {
    console.error("🚫 ERRORE FETCH:", error);
    return { success: false, error: error.message };
  } finally {
    console.log("🔍 === FINE DEBUG API ===");
  }
};

export function WorkloadContexts() {
  const [workloadData, setWorkloadData] = useState<Users[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 ESPORTA LA FUNZIONE DI DEBUG NEL CONTEXT
  const handleDebugUsersAPI = useCallback(async () => {
    await debugUsersAPI();
  }, []);

  const loadWorkload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔄 [DEBUG] Inizio caricamento users...");

      // 🔹 PRIMA ESEGUI IL DEBUG DETTAGLIATO
      console.log("🔍 Eseguo debug API prima della chiamata normale...");
      const debugResult = await debugUsersAPI();

      if (!debugResult.success) {
        throw new Error(
          `Debug API fallito: ${debugResult.error} (Status: ${debugResult.status})`
        );
      }

      // 🔹 POI PROVA LA CHIAMATA NORMALE CON L'API CLIENT
      console.log("📤 [DEBUG] Tentativo con API client normale...");
      const token = await getAccessToken();

      if (!token) {
        throw new Error("❌ Token non disponibile - effettua il login");
      }

      const res = await users.getUsers({
        pageNumber: 0,
        size: 10,
        sort: "id",
      });

      console.log("✅ [DEBUG] Users caricati con successo:", res);
      setWorkloadData(res || []);
    } catch (error: any) {
      console.error("❌ [DEBUG] Errore durante il caricamento users:", error);

      // 🔹 GESTIONE ERRORI MIGLIORATA
      let errorMessage = error.message || "Failed to load users";

      if (
        error.message?.includes("Unexpected token") ||
        error.message?.includes("DOCTYPE") ||
        error.message?.includes("<!") ||
        error.message?.includes("HTML")
      ) {
        errorMessage = `🔴 BACKEND RESTITUISCE HTML INVECE DI JSON

Problemi diagnosticati:
• Il backend sta restituendo una pagina HTML invece di dati JSON
• Possibile problema di autenticazione o routing

Soluzioni:
1. Controlla che il token JWT sia valido
2. Verifica che la route /api/v1/users esista nel backend
3. Controlla i log del backend Spring Boot
4. Testa l'API direttamente con Postman

Esegui debugUsersAPI() nella console per maggiori dettagli`;
      }

      setError(errorMessage);
      setWorkloadData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshWorkload = useCallback(async () => {
    await loadWorkload();
  }, [loadWorkload]);

  useEffect(() => {
    loadWorkload();
  }, [loadWorkload]);

  return (
    <WorkloadContext.Provider
      value={{
        workloadData,
        refreshWorkload,
        loading,
        error,
        debugUsersAPI: handleDebugUsersAPI, // 🔹 ESPORTA NEL CONTEXT
      }}
    >
      <Outlet />
    </WorkloadContext.Provider>
  );
}
