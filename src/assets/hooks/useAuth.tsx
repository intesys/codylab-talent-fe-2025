import { useEffect, useState } from "react";
import { type AccountInfo } from "@azure/msal-browser";
import {
  getAccessToken,
  msalInstance,
  authEnabled,
  initializeMsal,
} from "../../lib/api/msalInstance";

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<AccountInfo | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Se MSAL non è abilitato, salta l'autenticazione
        if (!authEnabled()) {
          setAuthenticated(true);
          setLoading(false);
          return;
        }

        // 🔹 IMPORTANTE: Aspetta che MSAL sia inizializzato
        await initializeMsal();

        // 🔹 Ora leggi lo stato degli account (MSAL è pronto)
        const accounts = msalInstance.getAllAccounts();

        if (accounts.length > 0) {
          const activeAccount = msalInstance.getActiveAccount() || accounts[0];
          msalInstance.setActiveAccount(activeAccount);
          setAccount(activeAccount);
          setAuthenticated(true);

          // Ottieni token in modo silenzioso
          try {
            const accessToken = await getAccessToken();
            setToken(accessToken);
          } catch (err) {
            console.error("Errore ottenimento token:", err);
            // Se fallisce, getAccessToken() gestirà il re-login automaticamente
            setAuthenticated(false);
          }
        } else {
          // ⚠️ NON chiamare loginRedirect qui!
          // Il login è gestito in App.tsx
          console.log("⚠️ Nessun account trovato in useAuth");
          setAuthenticated(false);
        }
      } catch (err) {
        console.error("❌ Errore inizializzazione auth:", err);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []); // ✅ Esegue solo una volta al mount

  // Funzione per aggiornare manualmente il token
  const refreshToken = async () => {
    try {
      const accessToken = await getAccessToken();
      setToken(accessToken);
      return accessToken;
    } catch (err) {
      console.error("Errore refresh token:", err);
      setToken(undefined);
      setAuthenticated(false);
      throw err;
    }
  };

  return {
    loading,
    authenticated,
    token,
    account,
    refreshToken,
  };
}
