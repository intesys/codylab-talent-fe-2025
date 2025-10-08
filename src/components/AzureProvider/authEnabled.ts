import { useEffect, useState } from "react";

import type { AccountInfo } from "@azure/msal-browser";
import { getAccessToken, msalInstance } from "../../lib/api/msalInstance";

export default function useAuth() {
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<AccountInfo | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 🔹 Controlla se esiste un account già loggato
        const accounts = msalInstance.getAllAccounts();

        if (accounts.length > 0) {
          msalInstance.setActiveAccount(accounts[0]);
          setAccount(accounts[0]);
          setAuthenticated(true);

          const accessToken = await getAccessToken();
          setToken(accessToken);
        } else {
          // 🔹 Nessun account → login redirect
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
