import { useEffect, useState } from "react";
import type { AccountInfo } from "@azure/msal-browser";
import {
  msalInstance,
  loginRequest,
  ManualgetAuthState, // 🔹 USA questa invece di getAccessToken
} from "../../lib/api/msalInstance";

export default function useAuth() {
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<AccountInfo | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("🔄 useAuth - Inizializzazione...");

        // 🔹 CRITICO: Gestisci redirect promise PRIMA di tutto
        const redirectResult = await msalInstance.handleRedirectPromise();

        if (redirectResult) {
          console.log("✅ useAuth - Redirect completato");
          if (redirectResult.account) {
            msalInstance.setActiveAccount(redirectResult.account);
            setAccount(redirectResult.account);
            setAuthenticated(true);

            // 🔹 NON chiamare getAccessToken qui - potrebbe causare loop
            console.log("✅ useAuth - Utente autenticato da redirect");
          }
          setLoading(false);
          return; // ⚠️ IMPORTANTE: esci qui
        }

        // 🔹 Controlla lo stato attuale dell'autenticazione
        const authState = ManualgetAuthState();
        console.log("🔍 useAuth - Stato:", authState);

        if (authState.isAuthenticated && authState.account) {
          // 🔹 UTENTE GIA' AUTENTICATO
          setAccount(authState.account);
          setAuthenticated(true);
          console.log("✅ useAuth - Utente già autenticato");
        } else {
          // 🔹 UTENTE NON AUTENTICATO - NON fare login automatico!
          setAuthenticated(false);
          setAccount(null);
          console.log(
            "🔐 useAuth - Utente non autenticato (login manuale richiesto)"
          );
        }
      } catch (err) {
        console.error("❌ useAuth - Errore:", err);
        setAuthenticated(false);
      } finally {
        setLoading(false);
        console.log("🏁 useAuth - Inizializzazione completata");
      }
    };

    initializeAuth();
  }, []);

  // 🔹 Funzione per login MANUALE (solo quando l'utente clicca)
  const login = async () => {
    try {
      console.log("🔐 useAuth - Avvio login manuale...");
      setLoading(true);
      await msalInstance.loginRedirect(loginRequest);
      // Il redirect interrompe l'esecuzione qui
    } catch (err) {
      console.error("❌ useAuth - Errore login:", err);
      setLoading(false);
    }
  };

  // 🔹 Funzione per logout
  const logout = async () => {
    try {
      setLoading(true);
      await msalInstance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin,
      });
    } catch (err) {
      console.error("❌ useAuth - Errore logout:", err);
      setLoading(false);
    }
  };

  // 🔹 Funzione per ottenere token (SOLO quando serve)
  const getToken = async (): Promise<string | null> => {
    if (!authenticated) {
      return null;
    }

    try {
      const account = msalInstance.getActiveAccount();
      if (!account) return null;

      const result = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account,
      });
      setToken(result.accessToken);
      return result.accessToken;
    } catch (error) {
      console.warn("⚠️ useAuth - Errore token:", error);
      return null;
    }
  };

  return {
    loading,
    authenticated,
    token,
    account,
    login, // ✅ Per login MANUALE
    logout, // ✅ Per logout
    getToken, // ✅ Per ottenere token quando serve
  };
}
