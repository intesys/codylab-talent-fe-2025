import { useEffect, useState } from "react";
import type { AccountInfo } from "@azure/msal-browser";
import {
  getAccessToken,
  msalInstance,
  loginRequest,
} from "../../lib/api/msalInstance";

export default function useAuth() {
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<AccountInfo | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 🔹 IMPORTANTE: Gestisci redirect MSAL prima di tutto
        const redirectResult = await msalInstance.handleRedirectPromise();

        // 🔹 Se c'è un redirect result, significa che siamo tornati da Azure AD
        if (redirectResult) {
          console.log(
            "✅ Redirect completato, account:",
            redirectResult.account
          );
          if (redirectResult.account) {
            msalInstance.setActiveAccount(redirectResult.account);
            setAccount(redirectResult.account);
            setAuthenticated(true);

            // Ottieni il token
            try {
              const accessToken = await getAccessToken();
              setToken(accessToken);
            } catch (tokenErr) {
              console.error("Errore ottenimento token:", tokenErr);
            }
          }
          setLoading(false);
          return; // ⚠️ IMPORTANTE: esci qui per evitare il loop
        }

        // 🔹 Controlla se ci sono account già loggati
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
          } catch (tokenErr) {
            console.warn("Token scaduto, login richiesto:", tokenErr);
            // Token scaduto, fai logout o richiedi nuovo login
            setAuthenticated(false);
          }
        } else {
          // 🔹 Nessun account trovato, NON sei in redirect
          console.log("Nessun account, reindirizzamento al login...");
          setAuthenticated(false);
        }
      } catch (err) {
        console.error("Errore inizializzazione MSAL:", err);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []); // ✅ Dipendenze vuote = esegue solo al mount

  // 🔹 Funzione separata per fare login
  const login = async () => {
    try {
      setLoading(true);
      await msalInstance.loginRedirect(loginRequest);
    } catch (err) {
      console.error("Errore durante il login:", err);
      setLoading(false);
    }
  };

  // 🔹 Funzione per logout
  const logout = async () => {
    try {
      setLoading(true);
      await msalInstance.logoutRedirect();
    } catch (err) {
      console.error("Errore durante il logout:", err);
      setLoading(false);
    }
  };

  return {
    loading,
    authenticated,
    token,
    account,
    login, // ✅ Esponi la funzione di login
    logout, // ✅ Esponi la funzione di logout
  };
}
