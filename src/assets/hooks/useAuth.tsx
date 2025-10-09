// src/assets/hooks/useAzureAuth.ts
import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { loginRequest } from "../../authConfig";

export const useAuth = () => {
  const { instance, accounts } = useMsal();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAccount = async () => {
      if (accounts && accounts.length > 0) {
        setAuthenticated(true);
      } else {
        try {
          await instance.handleRedirectPromise();
          const currentAccounts = instance.getAllAccounts();
          if (currentAccounts.length > 0) {
            setAuthenticated(true);
          }
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    };
    checkAccount();
  }, [accounts, instance]);

  const login = async () => {
    await instance.loginPopup(loginRequest);
    const currentAccounts = instance.getAllAccounts();
    if (currentAccounts.length > 0) {
      setAuthenticated(true);
    }
  };

  const logout = () => {
    instance.logoutPopup();
    setAuthenticated(false);
  };

  return { loading, authenticated, login, logout, accounts };
};
