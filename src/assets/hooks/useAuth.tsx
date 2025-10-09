import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { loginRequest } from "../../authConfig";

export const useAuth = () => {
  const { instance, inProgress } = useMsal();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState<boolean | undefined>(undefined);
  const [account, setAccount] = useState<any>(null);

  useEffect(() => {
    const initAuth = async () => {
      if (!instance) return;

      try {
        // Gestione redirect MSAL
        await instance.handleRedirectPromise();

        const currentAccounts = instance.getAllAccounts();
        if (currentAccounts.length > 0) {
          const activeAccount = instance.getActiveAccount() || currentAccounts[0];
          instance.setActiveAccount(activeAccount);
          setAccount(activeAccount);
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch (err) {
        console.error("Errore MSAL initialization:", err);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    if (inProgress === "none") {
      initAuth();
    }
  }, [instance, inProgress]);

  const login = async () => {
    try {
      const response = await instance.loginPopup(loginRequest);
      instance.setActiveAccount(response.account);
      setAccount(response.account);
      setAuthenticated(true);
    } catch (err) {
      console.error("Login fallito:", err);
    }
  };

const logout = () => {
  setAuthenticated(false);
  setAccount(null);
  setLoading(false);

  const accounts = instance.getAllAccounts();
  if (accounts.length > 0) {
    // logout dell'account attivo
    instance.logoutRedirect({
      account: accounts[0], 
      postLogoutRedirectUri: window.location.origin,
    });
  } else {
    // fallback
    window.location.href = window.location.origin;
  }
};

  return { loading, authenticated, account, login, logout };
};