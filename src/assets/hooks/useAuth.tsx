import { useEffect, useState } from "react";
import { type AccountInfo } from "@azure/msal-browser";
import { getAccessToken, msalInstance } from "../../lib/api/msalInstance";

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<AccountInfo | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 🔹 Inizializza MSAL (necessario se usi redirect flow)
        if ("initialize" in msalInstance) {
          // la funzione initialize() esiste solo su versioni recenti
          await msalInstance.initialize?.();
        }

        // 🔹 Ottieni account attivo
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          msalInstance.setActiveAccount(accounts[0]);
          setAccount(accounts[0]);
          setAuthenticated(true);

          const accessToken = await getAccessToken();
          setToken(accessToken);
        } else {
          // Nessun account → login redirect
          await msalInstance.loginRedirect();
        }
      } catch (err) {
        console.error("Errore inizializzazione MSAL:", err);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return { loading, authenticated, token, account };
}
