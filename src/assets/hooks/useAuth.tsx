import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { loginRequest } from "../../authConfig";

export const useAuth = () => {
  const { instance, inProgress } = useMsal();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [account, setAccount] = useState<any>(null);

  useEffect(() => {
    const initAuth = async () => {
      if (!instance) return;

      try {
        await instance.handleRedirectPromise();

        const accounts = instance.getAllAccounts();
        if (accounts.length > 0) {
          const activeAccount = instance.getActiveAccount() || accounts[0];
          instance.setActiveAccount(activeAccount);
          setAccount(activeAccount);
          setAuthenticated(true);
        } else {
          await instance.loginRedirect(loginRequest);
        }
      } catch (err) {
        console.error("Errore durante l'inizializzazione di MSAL:", err);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    if (inProgress === "none") {
      initAuth();
    }
  }, [instance, inProgress]);

  const logout = () => {
    setAuthenticated(false);
    setAccount(null);
    setLoading(false);
    const accounts = instance.getAllAccounts();
    if (accounts.length > 0) {
      instance.logoutRedirect({
        account: accounts[0],
        postLogoutRedirectUri: window.location.origin,
      });
    } else {
      window.location.href = window.location.origin;
    }
  };

  return {
    loading,
    authenticated,
    account,
    logout,
    };
};
